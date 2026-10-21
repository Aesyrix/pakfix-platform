<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\BookingMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Chat between a booking's customer and the professional doing the job.
 *
 * - Only those two people can read or write; anyone else gets a 404.
 * - It opens once a professional is assigned. It stays open while the job is
 *   live and for {@see self::OPEN_AFTER_DAYS} days after the customer confirms
 *   it, then becomes read-only. A cancelled job is read-only straight away.
 * - Phone numbers and email addresses typed into a message are masked:
 *   management rule 2.4 keeps contact details private, inside the app.
 * - Photos live on the private disk and are only served to the two people.
 */
class Chat
{
    public const OPEN_AFTER_DAYS = 7;

    public const MAX_BODY = 2000;

    private const DISK = 'local';

    public const PHONE_MASK = '[number hidden]';

    public const EMAIL_MASK = '[email hidden]';

    /** `customer`, `technician`, or null when the user is not on this job. */
    public function roleOf(Booking $booking, User $user): ?string
    {
        if ($booking->technician_profile_id === null) {
            return null;
        }
        if ($booking->customer_id === $user->id) {
            return 'customer';
        }
        $profile = $user->technicianProfile;

        return $profile !== null && $profile->id === $booking->technician_profile_id ? 'technician' : null;
    }

    /** The booking, if this user is one of its two participants; otherwise 404. */
    public function findFor(User $user, string $uuid): Booking
    {
        $booking = Booking::query()->where('uuid', $uuid)->with(['technicianProfile.user', 'customer', 'category'])->first();

        abort_if($booking === null || $this->roleOf($booking, $user) === null, 404, 'That chat does not exist.');

        return $booking;
    }

    /** When the chat stops accepting messages, or null while there is no end yet. */
    public function closesAt(Booking $booking): ?Carbon
    {
        return match ($booking->status) {
            BookingStatus::Cancelled, BookingStatus::Refunded => $booking->cancelled_at ?? $booking->updated_at,
            BookingStatus::CustomerConfirmed => ($booking->confirmed_at ?? $booking->updated_at)->copy()->addDays(self::OPEN_AFTER_DAYS),
            default => null,
        };
    }

    public function canSend(Booking $booking): bool
    {
        $closes = $this->closesAt($booking);

        return $booking->technician_profile_id !== null
            && ($closes === null || $closes->isFuture())
            && ! $this->isBlocked($booking);
    }

    /** Either person on the job has blocked the other. */
    public function isBlocked(Booking $booking): bool
    {
        $proUserId = $this->proUserId($booking);

        return $proUserId !== null && app(Safety::class)->blockedBetween((int) $booking->customer_id, $proUserId);
    }

    /** The other person on the job, from `$viewer`'s side. */
    public function otherParty(Booking $booking, User $viewer): ?User
    {
        $booking->loadMissing(['technicianProfile.user', 'customer']);

        return $this->roleOf($booking, $viewer) === 'customer' ? $booking->technicianProfile?->user : $booking->customer;
    }

    private function proUserId(Booking $booking): ?int
    {
        if ($booking->technician_profile_id === null) {
            return null;
        }
        $booking->loadMissing('technicianProfile');

        return $booking->technicianProfile?->user_id;
    }

    public function send(Booking $booking, User $sender, ?string $body, ?UploadedFile $photo): BookingMessage
    {
        if ($this->isBlocked($booking)) {
            throw ValidationException::withMessages(['body' => 'You cannot message this person.']);
        }
        if (! $this->canSend($booking)) {
            throw ValidationException::withMessages(['body' => 'This chat is closed.']);
        }

        $body = $body === null ? null : trim($body);
        if (($body === null || $body === '') && $photo === null) {
            throw ValidationException::withMessages(['body' => 'Write a message or add a photo.']);
        }

        return DB::transaction(function () use ($booking, $sender, $body, $photo): BookingMessage {
            $attachment = [];
            if ($photo !== null) {
                $extension = strtolower($photo->getClientOriginalExtension() ?: $photo->extension() ?: 'jpg');
                $attachment = [
                    'attachment_disk' => self::DISK,
                    'attachment_path' => $photo->storeAs("chat/{$booking->uuid}", Str::random(32).'.'.$extension, self::DISK),
                    'attachment_mime' => $photo->getMimeType(),
                ];
            }

            $message = $booking->messages()->create([
                'sender_id' => $sender->id,
                'body' => $body === null || $body === '' ? null : $this->mask($body),
                ...$attachment,
            ]);
            $booking->touch();

            return $message;
        });
    }

    /**
     * Messages oldest first: the latest page, or only those after `$afterId`
     * (for polling), or the page before `$beforeId` (for scrolling back).
     *
     * @return Collection<int, BookingMessage>
     */
    public function messages(Booking $booking, ?string $afterId, ?string $beforeId, int $limit = 50): Collection
    {
        $query = $booking->messages()->getQuery()->reorder();

        if ($afterId !== null) {
            $after = $this->idOf($booking, $afterId);

            return $query->where('id', '>', $after)->orderBy('id')->limit(200)->get();
        }
        if ($beforeId !== null) {
            $query->where('id', '<', $this->idOf($booking, $beforeId));
        }

        return $query->orderByDesc('id')->limit($limit)->get()->reverse()->values();
    }

    /** Marks everything the other person sent as read by `$reader`. */
    public function markRead(Booking $booking, User $reader): void
    {
        $booking->messages()->getQuery()
            ->where('sender_id', '!=', $reader->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * The user's chats (one per booking with a professional), most recent
     * activity first, with the unread count and the last message.
     *
     * @return Collection<int, Booking>
     */
    public function conversations(User $user): Collection
    {
        $profileId = $user->technicianProfile?->id;

        return Booking::query()
            ->whereNotNull('technician_profile_id')
            ->where(function ($q) use ($user, $profileId): void {
                $q->where('customer_id', $user->id);
                if ($profileId !== null) {
                    $q->orWhere('technician_profile_id', $profileId);
                }
            })
            ->with(['technicianProfile.user', 'customer', 'category'])
            ->withCount(['messages as unread_count' => fn ($q) => $q->where('sender_id', '!=', $user->id)->whereNull('read_at')])
            ->addSelect([
                'last_message_id' => BookingMessage::query()->select('id')->whereColumn('booking_id', 'bookings.id')->orderByDesc('id')->limit(1),
            ])
            // A new message touches the booking, so this is "latest activity".
            ->orderByDesc('updated_at')
            ->limit(100)
            ->get();
    }

    public function unreadTotal(User $user): int
    {
        $profileId = $user->technicianProfile?->id;

        return BookingMessage::query()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->whereHas('booking', function ($q) use ($user, $profileId): void {
                $q->whereNotNull('technician_profile_id')->where(function ($q) use ($user, $profileId): void {
                    $q->where('customer_id', $user->id);
                    if ($profileId !== null) {
                        $q->orWhere('technician_profile_id', $profileId);
                    }
                });
            })
            ->count();
    }

    /**
     * Hides phone numbers (any run of 10+ digits, spaces, dashes or dots, e.g.
     * 0300-1234567, +92 300 1234567) and email addresses.
     */
    public function mask(string $text): string
    {
        $text = (string) preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', self::EMAIL_MASK, $text);

        return (string) preg_replace_callback(
            '/\+?\d[\d\s().-]{8,}\d/',
            fn (array $m) => strlen((string) preg_replace('/\D/', '', $m[0])) >= 10 ? self::PHONE_MASK : $m[0],
            $text,
        );
    }

    private function idOf(Booking $booking, string $uuid): int
    {
        $id = $booking->messages()->getQuery()->where('uuid', $uuid)->value('id');
        abort_if($id === null, 404, 'That message does not exist.');

        return (int) $id;
    }
}
