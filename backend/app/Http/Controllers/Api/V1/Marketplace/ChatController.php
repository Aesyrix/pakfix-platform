<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingMessage;
use App\Models\User;
use App\Services\Marketplace\Chat;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Booking chat for both sides of a job. The same routes serve the customer
 * and the professional; who you are on the booking decides what you see.
 */
class ChatController extends Controller
{
    public function __construct(private readonly Chat $chat) {}

    /** `GET /conversations` — one row per booking with a professional. */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $bookings = $this->chat->conversations($user);
        $last = BookingMessage::query()
            ->whereIn('id', $bookings->pluck('last_message_id')->filter())
            ->get()
            ->keyBy('id');

        $rows = $bookings->map(function (Booking $b) use ($user, $last): array {
            $role = $this->chat->roleOf($b, $user);
            $message = $last->get($b->getAttribute('last_message_id'));

            return [
                'booking_id' => $b->uuid,
                'reference' => $b->reference,
                'status' => $b->status->value,
                'category' => $b->category?->name,
                'role' => $role,
                'with' => $this->party($b, $role),
                'last_message' => $message === null ? null : [
                    'preview' => $message->body ?? null,
                    'has_photo' => $message->hasAttachment(),
                    'mine' => $message->sender_id === $user->id,
                    'created_at' => $message->created_at->toIso8601String(),
                ],
                'unread_count' => (int) $b->getAttribute('unread_count'),
                'can_send' => $this->chat->canSend($b),
                'updated_at' => $b->updated_at->toIso8601String(),
            ];
        });

        return ApiResponse::success($rows->values(), 'OK', meta: ['unread_total' => $this->chat->unreadTotal($user)]);
    }

    /** `GET /conversations/unread` — the badge count, cheap enough to poll. */
    public function unread(Request $request): JsonResponse
    {
        return ApiResponse::success(['unread_total' => $this->chat->unreadTotal($request->user())]);
    }

    /**
     * `GET /bookings/{uuid}/messages?after=<id>|before=<id>` — oldest first.
     * Reading the chat marks the other person's messages as read.
     */
    public function messages(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'after' => ['nullable', 'uuid'],
            'before' => ['nullable', 'uuid'],
        ]);
        $user = $request->user();
        $booking = $this->chat->findFor($user, $uuid);

        $messages = $this->chat->messages($booking, $data['after'] ?? null, $data['before'] ?? null);
        $this->chat->markRead($booking, $user);

        return ApiResponse::success(
            $messages->map(fn (BookingMessage $m) => $this->message($booking, $m, $user))->values(),
            'OK',
            meta: $this->meta($booking, $user),
        );
    }

    /** `POST /bookings/{uuid}/messages` — multipart: `body` and/or `photo`. */
    public function store(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'body' => ['nullable', 'string', 'max:'.Chat::MAX_BODY],
            'photo' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,heic,heif', 'max:8192'],
        ], [
            'photo.image' => 'Only photos can be sent.',
            'photo.max' => 'That photo is too large (8 MB at most).',
        ]);
        $user = $request->user();
        $booking = $this->chat->findFor($user, $uuid);

        $message = $this->chat->send($booking, $user, $data['body'] ?? null, $request->file('photo'));

        return ApiResponse::created($this->message($booking, $message, $user), 'Sent.');
    }

    /** `GET /bookings/{uuid}/messages/{id}/photo` — only for the two people on the job. */
    public function photo(Request $request, string $uuid, string $id): StreamedResponse
    {
        $booking = $this->chat->findFor($request->user(), $uuid);
        $message = $booking->messages()->getQuery()->where('uuid', $id)->first();

        abort_if($message === null || ! $message->hasAttachment(), 404, 'That photo does not exist.');
        abort_unless(Storage::disk($message->attachment_disk)->exists($message->attachment_path), 404, 'That photo is missing.');

        return Storage::disk($message->attachment_disk)->response($message->attachment_path, null, [
            'Content-Type' => $message->attachment_mime ?? 'application/octet-stream',
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    /** @return array<string, mixed> */
    private function message(Booking $booking, BookingMessage $m, User $viewer): array
    {
        $mine = $m->sender_id === $viewer->id;

        return [
            'id' => $m->uuid,
            'body' => $m->body,
            'mine' => $mine,
            'from' => $m->sender_id === $booking->customer_id ? 'customer' : 'technician',
            'photo' => $m->hasAttachment()
                ? ['path' => "bookings/{$booking->uuid}/messages/{$m->uuid}/photo", 'mime' => $m->attachment_mime]
                : null,
            // Only your own messages show whether the other person has read them.
            'read' => $mine ? $m->read_at !== null : null,
            'created_at' => $m->created_at->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function meta(Booking $booking, User $viewer): array
    {
        $role = $this->chat->roleOf($booking, $viewer);
        $closes = $this->chat->closesAt($booking);

        return [
            'chat' => [
                'booking_id' => $booking->uuid,
                'reference' => $booking->reference,
                'status' => $booking->status->value,
                'category' => $booking->category?->name,
                'role' => $role,
                'with' => $this->party($booking, $role),
                'can_send' => $this->chat->canSend($booking),
                'closes_at' => $closes?->toIso8601String(),
            ],
        ];
    }

    /**
     * The other person: the customer sees the professional's name and photo;
     * the professional sees the customer's first name (as on the booking).
     *
     * @return array{name: string|null, avatar_url: string|null}
     */
    private function party(Booking $booking, ?string $viewerRole): array
    {
        if ($viewerRole === 'customer') {
            $p = $booking->technicianProfile;
            $avatar = $p?->user?->avatar_path;

            return ['name' => $p?->displayName(), 'avatar_url' => $avatar ? Storage::url($avatar) : null];
        }

        return ['name' => strtok((string) $booking->customer?->name, ' ') ?: null, 'avatar_url' => null];
    }
}
