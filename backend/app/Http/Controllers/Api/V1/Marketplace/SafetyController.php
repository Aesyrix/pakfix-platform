<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserReport;
use App\Services\Marketplace\Chat;
use App\Services\Marketplace\Safety;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Report or block the other person on a job, and manage your blocked list.
 * Only the customer and the professional on the booking can do either.
 */
class SafetyController extends Controller
{
    public function __construct(private readonly Chat $chat, private readonly Safety $safety) {}

    /** `POST /bookings/{uuid}/report` — `{ reason, details?, message_id? }` */
    public function report(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', Rule::in(UserReport::REASONS)],
            'details' => ['nullable', 'string', 'max:2000'],
            'message_id' => ['nullable', 'uuid'],
        ], ['reason.required' => 'Choose a reason.']);

        $user = $request->user();
        $booking = $this->chat->findFor($user, $uuid);
        $other = $this->chat->otherParty($booking, $user) ?? abort(404, 'That person does not exist.');

        $report = $this->safety->report($booking, $user, $other, $data);

        return ApiResponse::created(
            ['id' => $report->uuid, 'status' => $report->status],
            'Thanks. PakFix will review this, usually within 24 hours.',
        );
    }

    /** `POST /bookings/{uuid}/block` */
    public function block(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $booking = $this->chat->findFor($user, $uuid);
        $other = $this->chat->otherParty($booking, $user) ?? abort(404, 'That person does not exist.');

        $this->safety->block($user, $other);

        return ApiResponse::success(['blocked' => 'by_me'], 'Blocked. You will not hear from them again.');
    }

    /** `DELETE /bookings/{uuid}/block` */
    public function unblock(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $booking = $this->chat->findFor($user, $uuid);
        $other = $this->chat->otherParty($booking, $user) ?? abort(404, 'That person does not exist.');

        $this->safety->unblock($user, $other);

        return ApiResponse::success(['blocked' => $this->safety->blockState($user->id, $other->id)], 'Unblocked.');
    }

    /** `GET /blocks` — people you have blocked. */
    public function index(Request $request): JsonResponse
    {
        $rows = UserBlock::query()
            ->where('blocker_id', $request->user()->id)
            ->with('blocked.technicianProfile')
            ->latest()
            ->get()
            ->map(fn (UserBlock $b) => [
                'user_id' => $b->blocked?->uuid,
                'name' => $this->displayName($b->blocked),
                'blocked_at' => $b->created_at->toIso8601String(),
            ])
            ->filter(fn (array $row) => $row['user_id'] !== null)
            ->values();

        return ApiResponse::success($rows);
    }

    /** `DELETE /blocks/{userUuid}` */
    public function destroy(Request $request, string $userUuid): JsonResponse
    {
        $other = User::query()->where('uuid', $userUuid)->firstOr(fn () => abort(404, 'That person does not exist.'));
        $this->safety->unblock($request->user(), $other);

        return ApiResponse::success(null, 'Unblocked.');
    }

    /** Professionals by their business name; customers by first name only. */
    private function displayName(?User $user): ?string
    {
        if ($user === null) {
            return null;
        }
        $profile = $user->technicianProfile;

        return $profile !== null ? $profile->displayName() : (strtok((string) $user->name, ' ') ?: null);
    }
}
