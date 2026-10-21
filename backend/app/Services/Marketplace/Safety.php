<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Models\Booking;
use App\Models\BookingMessage;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserReport;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Reports and blocks between the two people on a job.
 *
 * A block works both ways: neither side can message the other, the blocked
 * professional stops seeing the customer's requests, and neither can start a
 * new job together. A report goes to PakFix's moderation queue with a copy of
 * what was reported.
 */
class Safety
{
    public function __construct(private readonly AuditLogger $audit) {}

    /** Whether either of the two has blocked the other. */
    public function blockedBetween(int $a, int $b): bool
    {
        return UserBlock::query()
            ->where(fn ($q) => $q->where('blocker_id', $a)->where('blocked_id', $b))
            ->orWhere(fn ($q) => $q->where('blocker_id', $b)->where('blocked_id', $a))
            ->exists();
    }

    /** `by_me`, `by_them`, or null, from `$viewer`'s side. */
    public function blockState(int $viewer, int $other): ?string
    {
        $rows = UserBlock::query()
            ->where(fn ($q) => $q->where('blocker_id', $viewer)->where('blocked_id', $other))
            ->orWhere(fn ($q) => $q->where('blocker_id', $other)->where('blocked_id', $viewer))
            ->pluck('blocker_id');

        if ($rows->contains($viewer)) {
            return 'by_me';
        }

        return $rows->isEmpty() ? null : 'by_them';
    }

    /**
     * Everyone this user has blocked or been blocked by.
     *
     * @return list<int>
     */
    public function blockedIds(int $userId): array
    {
        return UserBlock::query()
            ->where('blocker_id', $userId)->pluck('blocked_id')
            ->merge(UserBlock::query()->where('blocked_id', $userId)->pluck('blocker_id'))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    public function block(User $blocker, User $blocked): void
    {
        if ($blocker->id === $blocked->id) {
            throw ValidationException::withMessages(['user' => 'You cannot block yourself.']);
        }

        $block = UserBlock::firstOrCreate(['blocker_id' => $blocker->id, 'blocked_id' => $blocked->id]);
        if ($block->wasRecentlyCreated) {
            $this->audit->record('user.blocked', $blocked, [], [], "{$blocker->name} blocked {$blocked->name}.", $blocker);
        }
    }

    public function unblock(User $blocker, User $blocked): void
    {
        UserBlock::query()->where('blocker_id', $blocker->id)->where('blocked_id', $blocked->id)->delete();
    }

    /**
     * Reports the other person on `$booking`, or one of their messages.
     *
     * @param  array{reason: string, details?: string|null, message_id?: string|null}  $data
     */
    public function report(Booking $booking, User $reporter, User $reported, array $data): UserReport
    {
        $message = null;
        if (! empty($data['message_id'])) {
            $message = $booking->messages()->getQuery()->where('uuid', $data['message_id'])->first();
            if ($message === null || $message->sender_id !== $reported->id) {
                throw ValidationException::withMessages(['message_id' => 'You can only report a message the other person sent.']);
            }
        }

        return DB::transaction(function () use ($booking, $reporter, $reported, $data, $message): UserReport {
            $report = UserReport::create([
                'reporter_id' => $reporter->id,
                'reported_user_id' => $reported->id,
                'booking_id' => $booking->id,
                'booking_message_id' => $message?->id,
                'reason' => $data['reason'],
                'details' => $data['details'] ?? null,
                'snapshot' => $message === null ? null : $this->snapshot($message),
                'status' => UserReport::STATUS_OPEN,
            ]);
            $this->audit->record('user.reported', $report, [], ['reason' => $report->reason], "{$reporter->name} reported {$reported->name} ({$report->reason}).", $reporter);

            return $report;
        });
    }

    /** A moderator closes or updates a report. */
    public function resolve(UserReport $report, User $moderator, string $status, ?string $resolution): UserReport
    {
        $before = ['status' => $report->status];
        $report->forceFill([
            'status' => $status,
            'resolution' => $resolution,
            'handled_by' => $moderator->id,
            'handled_at' => now(),
        ])->save();
        $this->audit->record('user.report.updated', $report, $before, ['status' => $status], "Report {$report->uuid}: {$status}.", $moderator);

        return $report;
    }

    private function snapshot(BookingMessage $message): string
    {
        $text = $message->body ?? '';
        if ($message->hasAttachment()) {
            $text = trim($text.' [photo: '.$message->uuid.']');
        }

        return $text;
    }
}
