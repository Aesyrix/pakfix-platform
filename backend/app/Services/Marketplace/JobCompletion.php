<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Enums\BookingStatus;
use App\Enums\DisputeStatus;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\TechnicianProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Makes sure a booked job always ends, and ends honestly.
 *
 * Once the professional sets off, a job cannot be cancelled by either side;
 * it can only end as confirmed or through a dispute PakFix decides:
 *
 *  - The professional finishes with the customer's code (confirmed at once),
 *    or without it (the customer then confirms or disputes).
 *  - The customer can say the work is done even if the professional never
 *    tapped "done".
 *  - A job in progress for too long is marked done; a job marked done is
 *    confirmed after a waiting period unless someone disputes it.
 *  - Where the professional was at "arrived" and "done" is recorded, and a
 *    position far from the address is flagged for PakFix.
 *  - Strikes for pros who back out on the way or lose a dispute; enough
 *    strikes stop them sending offers.
 */
class JobCompletion
{
    /** Jobs where the professional has started; the customer may mark them done. */
    public const IN_PROGRESS = [
        BookingStatus::TechnicianOnWay, BookingStatus::Arrived, BookingStatus::InspectionStarted,
        BookingStatus::QuoteAccepted, BookingStatus::RepairStarted,
    ];

    /** In progress for long enough to be marked done automatically (needs "arrived"). */
    private const AUTO_COMPLETABLE = [
        BookingStatus::Arrived, BookingStatus::InspectionStarted, BookingStatus::QuoteAccepted, BookingStatus::RepairStarted,
    ];

    public function __construct(private readonly BookingFlow $flow) {}

    // -----------------------------------------------------------------
    // Deadlines
    // -----------------------------------------------------------------

    /** When a job in progress will be marked done. */
    public function autoCompleteAt(Booking $booking): ?Carbon
    {
        if (! in_array($booking->status, self::AUTO_COMPLETABLE, true) || $booking->arrived_at === null) {
            return null;
        }

        return $booking->arrived_at->copy()->addHours($this->hours('auto_complete_hours'));
    }

    /** When a job marked done will be confirmed. */
    public function autoConfirmAt(Booking $booking): ?Carbon
    {
        if ($booking->status !== BookingStatus::Completed || $booking->completed_at === null) {
            return null;
        }

        return $booking->completed_at->copy()->addHours($this->hours('auto_confirm_hours'));
    }

    /** Until when a confirmed job can still be disputed. */
    public function disputeUntil(Booking $booking): ?Carbon
    {
        return match (true) {
            $booking->status === BookingStatus::Completed => $this->autoConfirmAt($booking)?->addHours($this->hours('dispute_hours')),
            $booking->status === BookingStatus::CustomerConfirmed && $booking->confirmed_at !== null => $booking->confirmed_at->copy()->addHours($this->hours('dispute_hours')),
            default => null,
        };
    }

    /** From when the customer may report that the professional never came. */
    public function noShowFrom(Booking $booking): ?Carbon
    {
        if ($booking->status !== BookingStatus::TechnicianOnWay || $booking->on_way_at === null) {
            return null;
        }

        return $booking->on_way_at->copy()->addMinutes((int) config('pakfix.marketplace.completion.no_show_minutes', 180));
    }

    /** @return array<string, string|null> */
    public function deadlines(Booking $booking): array
    {
        return [
            'auto_complete_at' => $this->autoCompleteAt($booking)?->toIso8601String(),
            'auto_confirm_at' => $this->autoConfirmAt($booking)?->toIso8601String(),
            'dispute_until' => $this->disputeUntil($booking)?->toIso8601String(),
            'no_show_from' => $this->noShowFrom($booking)?->toIso8601String(),
        ];
    }

    // -----------------------------------------------------------------
    // What each side may do
    // -----------------------------------------------------------------

    public function canDispute(Booking $booking, string $role): bool
    {
        if ($this->hasDispute($booking)) {
            return false; // one dispute per job; PakFix handles anything further
        }

        if ($role === 'technician') {
            // The customer is not confirming or has not paid.
            return $booking->status === BookingStatus::Completed;
        }

        return match (true) {
            in_array($booking->status, self::AUTO_COMPLETABLE, true), $booking->status === BookingStatus::QuoteCreated => true,
            $booking->status === BookingStatus::Completed => true,
            $booking->status === BookingStatus::CustomerConfirmed => ($until = $this->disputeUntil($booking)) !== null && now()->lt($until),
            default => false,
        };
    }

    public function canReportNoShow(Booking $booking): bool
    {
        $from = $this->noShowFrom($booking);

        return $from !== null && now()->gte($from) && ! $this->hasDispute($booking);
    }

    // -----------------------------------------------------------------
    // Location
    // -----------------------------------------------------------------

    /** Records where the professional was at "arrived" or "done". */
    public function recordLocation(Booking $booking, string $moment, ?float $lat, ?float $lng): void
    {
        if ($lat === null || $lng === null) {
            return;
        }

        $distance = $this->metresBetween($booking->latitude, $booking->longitude, $lat, $lng);
        $booking->forceFill([
            "{$moment}_latitude" => $lat,
            "{$moment}_longitude" => $lng,
            "{$moment}_distance_m" => $distance,
        ])->save();
    }

    public function isFarFromAddress(?int $distance): bool
    {
        return $distance !== null && $distance > (int) config('pakfix.marketplace.completion.location_radius_m', 1000);
    }

    // -----------------------------------------------------------------
    // Disputes
    // -----------------------------------------------------------------

    /** Either side raises a problem; the job waits for PakFix's decision. */
    public function openDispute(Booking $booking, User $actor, string $role, string $kind, string $description): Dispute
    {
        $allowed = $kind === 'no_show'
            ? $role === 'customer' && $this->canReportNoShow($booking)
            : $this->canDispute($booking, $role);

        if (! $allowed) {
            throw ValidationException::withMessages([
                'dispute' => $kind === 'no_show'
                    ? 'You can report a no-show once the professional is late. If they are on the way, give them a little more time.'
                    : 'A problem can no longer be reported for this job. Contact PakFix support.',
            ]);
        }

        return DB::transaction(function () use ($booking, $actor, $role, $kind, $description): Dispute {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();

            $dispute = Dispute::create([
                'booking_id' => $booking->id,
                'raised_by_user_id' => $actor->id,
                'technician_profile_id' => $booking->technician_profile_id,
                'kind' => $kind,
                'raised_by_role' => $role,
                'description' => $description,
                'status' => DisputeStatus::Open,
            ]);

            $this->flow->transition($booking, BookingStatus::Disputed, $actor, $role, "Problem reported ({$dispute->reference}).", [
                'dispute' => $dispute->reference,
                'kind' => $kind,
                'from' => $booking->status->value,
            ]);

            return $dispute;
        });
    }

    /**
     * PakFix decides: the job is completed (the professional is owed) or
     * cancelled (nothing is owed), optionally with a strike for the professional.
     */
    public function resolveDispute(Dispute $dispute, User $admin, string $outcome, bool $strike, ?string $note): Dispute
    {
        if (! $dispute->isOpen()) {
            throw ValidationException::withMessages(['dispute' => 'This dispute has already been decided.']);
        }

        return DB::transaction(function () use ($dispute, $admin, $outcome, $strike, $note): Dispute {
            $dispute = Dispute::whereKey($dispute->id)->lockForUpdate()->firstOrFail();
            $booking = Booking::whereKey($dispute->booking_id)->lockForUpdate()->firstOrFail();
            $wasConfirmed = $booking->confirmed_at !== null;

            if ($booking->status === BookingStatus::Disputed) {
                if ($outcome === 'complete') {
                    $booking->forceFill(['completed_via' => 'admin', 'completed_at' => $booking->completed_at ?? now()]);
                    $this->flow->finishConfirmed($booking, $admin, 'admin', "PakFix decided {$dispute->reference}: job completed.", countJob: ! $wasConfirmed);
                } else {
                    $booking->forceFill([
                        'cancelled_by_user_id' => $admin->id,
                        'cancellation_reason' => $note ?: "Cancelled after dispute {$dispute->reference}.",
                        'payment_status' => PaymentStatus::Cancelled,
                    ]);
                    $this->flow->transition($booking, BookingStatus::Cancelled, $admin, 'admin', "PakFix decided {$dispute->reference}: job cancelled.");
                    if ($wasConfirmed && $booking->technician_profile_id) {
                        TechnicianProfile::whereKey($booking->technician_profile_id)->where('completed_jobs_count', '>', 0)->decrement('completed_jobs_count');
                    }
                }
            }

            if ($strike && $booking->technician_profile_id) {
                $this->strike((int) $booking->technician_profile_id);
            }

            $dispute->forceFill([
                'status' => DisputeStatus::Resolved,
                'outcome' => $outcome,
                'strike_given' => $strike,
                'resolution_note' => $note,
                'resolved_by_user_id' => $admin->id,
                'resolved_at' => now(),
            ])->save();

            return $dispute;
        });
    }

    public function strike(int $technicianProfileId): void
    {
        TechnicianProfile::whereKey($technicianProfileId)->increment('strikes_count');
    }

    // -----------------------------------------------------------------
    // Automatic steps
    // -----------------------------------------------------------------

    /**
     * Applies any deadline that has passed. Runs when a job is opened and from
     * the scheduler, so it works even without a cron job on the server.
     */
    public function settle(Booking $booking): Booking
    {
        if (($at = $this->autoCompleteAt($booking)) !== null && now()->gte($at)) {
            DB::transaction(function () use ($booking): void {
                $locked = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
                if (in_array($locked->status, self::AUTO_COMPLETABLE, true)) {
                    $locked->forceFill(['completed_via' => 'auto']);
                    $this->flow->transition($locked, BookingStatus::Completed, null, 'system', 'Marked done automatically: no update from the professional.');
                }
            });
            $booking->refresh();
        }

        if (($at = $this->autoConfirmAt($booking)) !== null && now()->gte($at)) {
            DB::transaction(function () use ($booking): void {
                $locked = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
                if ($locked->status === BookingStatus::Completed) {
                    $this->flow->finishConfirmed($locked, null, 'system', 'Confirmed automatically: no problem was reported.');
                }
            });
            $booking->refresh();
        }

        return $booking;
    }

    /** Settles every job with a deadline that may have passed. Returns how many changed. */
    public function settleAll(): int
    {
        $changed = 0;
        $completeBefore = now()->subHours($this->hours('auto_complete_hours'));
        $confirmBefore = now()->subHours($this->hours('auto_confirm_hours'));

        Booking::query()
            ->where(fn ($q) => $q
                ->where(fn ($q) => $q->whereIn('status', array_map(fn ($s) => $s->value, self::AUTO_COMPLETABLE))->where('arrived_at', '<=', $completeBefore))
                ->orWhere(fn ($q) => $q->where('status', BookingStatus::Completed->value)->where('completed_at', '<=', $confirmBefore)))
            ->orderBy('id')
            ->chunkById(100, function ($bookings) use (&$changed): void {
                foreach ($bookings as $booking) {
                    $before = $booking->status;
                    if ($this->settle($booking)->status !== $before) {
                        $changed++;
                    }
                }
            });

        return $changed;
    }

    /** Settles one user's open jobs before they are listed. */
    public function settleFor(Builder $query): void
    {
        $query->clone()
            ->whereIn('status', [...array_map(fn ($s) => $s->value, self::AUTO_COMPLETABLE), BookingStatus::Completed->value])
            ->limit(50)
            ->get()
            ->each(fn (Booking $b) => $this->settle($b));
    }

    private function hasDispute(Booking $booking): bool
    {
        return $booking->relationLoaded('disputes')
            ? $booking->disputes->isNotEmpty()
            : $booking->disputes()->exists();
    }

    private function hours(string $key): int
    {
        return max(1, (int) config("pakfix.marketplace.completion.{$key}", 72));
    }

    private function metresBetween(?float $lat1, ?float $lng1, float $lat2, float $lng2): ?int
    {
        if ($lat1 === null || $lng1 === null) {
            return null;
        }

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return (int) round(6371000 * 2 * atan2(sqrt($a), sqrt(1 - $a)));
    }
}
