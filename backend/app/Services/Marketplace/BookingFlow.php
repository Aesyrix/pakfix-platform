<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\QuoteStatus;
use App\Models\Booking;
use App\Models\Quote;
use App\Models\TechnicianProfile;
use App\Models\User;
use App\Services\Notifications\Notifier;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Moves a booking through its life after an offer is accepted.
 *
 * Every change goes through {@see transition()}, which checks the move against
 * {@see BookingStatus::allowedNext()}, stamps the matching timestamp and
 * appends to the append-only status history. Who may do what is decided here
 * too, so the app can only offer what this class would accept.
 *
 *   accepted → (scheduled) → technician_on_way → arrived → inspection_started
 *     → repair_started → completed → customer_confirmed
 *   inspection_started → quote_created → quote_accepted → repair_started
 *                                      ↘ cancelled (visit fee only)
 */
class BookingFlow
{
    /** Steps a professional takes, keyed by the action name the app sends. */
    public const PRO_STEPS = [
        'on_way' => BookingStatus::TechnicianOnWay,
        'arrived' => BookingStatus::Arrived,
        'inspecting' => BookingStatus::InspectionStarted,
        'working' => BookingStatus::RepairStarted,
        'completed' => BookingStatus::Completed,
    ];

    /** The professional's next step from each status, if they have one. */
    private const PRO_NEXT = [
        'accepted' => 'on_way',
        'scheduled' => 'on_way',
        'technician_on_way' => 'arrived',
        'arrived' => 'inspecting',
        'inspection_started' => 'working',
        'quote_accepted' => 'working',
        'repair_started' => 'completed',
    ];

    /** The customer may cancel for free until the professional sets off. */
    private const CUSTOMER_CANCELLABLE = [BookingStatus::Accepted, BookingStatus::Scheduled];

    /** A professional may cancel until they arrive; it counts against them. */
    private const PRO_CANCELLABLE = [BookingStatus::Accepted, BookingStatus::Scheduled, BookingStatus::TechnicianOnWay];

    /**
     * What this viewer can do right now, for the app to offer (and grey out the rest).
     *
     * @return list<string>
     */
    public function actionsFor(Booking $booking, string $role): array
    {
        $status = $booking->status;

        if ($role === 'technician') {
            $actions = [];
            if ($next = self::PRO_NEXT[$status->value] ?? null) {
                $actions[] = $next;
            }
            if ($status === BookingStatus::InspectionStarted) {
                $actions[] = 'revised_quote';
            }
            if (in_array($status, self::PRO_CANCELLABLE, true)) {
                $actions[] = 'cancel';
            }

            return $actions;
        }

        return match (true) {
            $status === BookingStatus::CustomerConfirmed && ! $booking->is_reviewed => ['review'],
            $status === BookingStatus::Completed => ['confirm'],
            $status === BookingStatus::QuoteCreated => ['accept_quote', 'reject_quote'],
            in_array($status, self::CUSTOMER_CANCELLABLE, true) => ['cancel'],
            default => [],
        };
    }

    /** A professional's step: on_way, arrived, inspecting, working or completed. */
    public function advance(Booking $booking, TechnicianProfile $profile, User $actor, string $step, ?string $note = null): Booking
    {
        if (! in_array($step, $this->actionsFor($booking, 'technician'), true) || ! isset(self::PRO_STEPS[$step])) {
            throw ValidationException::withMessages([
                'status' => 'That step is not available for this job right now.',
            ]);
        }

        return DB::transaction(function () use ($booking, $actor, $step, $note): Booking {
            $booking = $this->lock($booking);
            $target = self::PRO_STEPS[$step];

            // Setting off from an accepted job passes through "scheduled".
            if ($target === BookingStatus::TechnicianOnWay && $booking->status === BookingStatus::Accepted) {
                $this->transition($booking, BookingStatus::Scheduled, $actor, 'technician', 'Professional confirmed the visit.');
            }

            return $this->transition($booking, $target, $actor, 'technician', $note);
        });
    }

    /**
     * A revised price after inspection. The visit fee stays as agreed; labour
     * and materials are replaced, and the customer must approve before work goes on.
     *
     * @param array{labour_minor:int, materials_minor:int, notes?:string|null} $data
     */
    public function reviseQuote(Booking $booking, TechnicianProfile $profile, User $actor, array $data): Quote
    {
        if (! in_array('revised_quote', $this->actionsFor($booking, 'technician'), true)) {
            throw ValidationException::withMessages([
                'quote' => 'A revised price can only be sent while inspecting the job.',
            ]);
        }

        $labour = (int) $data['labour_minor'];
        $materials = (int) $data['materials_minor'];
        if ($labour + $materials <= 0) {
            throw ValidationException::withMessages(['labour_minor' => 'Enter the revised price.']);
        }

        return DB::transaction(function () use ($booking, $profile, $actor, $data, $labour, $materials): Quote {
            $booking = $this->lock($booking);
            $visit = (int) $booking->visit_fee_minor;

            $quote = new Quote([
                'booking_id' => $booking->id,
                'technician_profile_id' => $profile->id,
                'company_id' => $booking->company_id,
                'customer_id' => $booking->customer_id,
                'status' => QuoteStatus::Sent,
                'notes' => $data['notes'] ?? null,
                'sent_at' => now(),
            ]);
            $quote->forceFill([
                'visit_fee_minor' => $visit,
                'labour_minor' => $labour,
                'materials_minor' => $materials,
                'total_minor' => $visit + $labour + $materials,
            ])->save();

            foreach ([['visit_fee', 'Visit / inspection fee', $visit], ['labour', 'Labour', $labour], ['material', 'Materials', $materials]] as $i => [$type, $label, $amount]) {
                if ($amount > 0) {
                    $quote->items()->create([
                        'type' => $type, 'description' => $label, 'quantity' => 1,
                        'unit_price_minor' => $amount, 'sort_order' => $i,
                    ]);
                }
            }

            $this->transition($booking, BookingStatus::QuoteCreated, $actor, 'technician', "Revised price {$quote->reference} sent.", [
                'quote' => $quote->reference,
                'total_minor' => $quote->total_minor,
            ]);
            app(Notifier::class)->revisedPrice($booking);

            return $quote;
        });
    }

    /** The customer approves the revised price: the booking takes its money. */
    public function acceptRevisedQuote(Booking $booking, User $customer): Booking
    {
        return DB::transaction(function () use ($booking, $customer): Booking {
            $booking = $this->lock($booking);
            $quote = $this->pendingQuote($booking);

            $quote->forceFill(['status' => QuoteStatus::Accepted, 'responded_at' => now()])->save();
            $commission = Commission::on((int) $quote->total_minor);
            $booking->forceFill([
                'labour_minor' => $quote->labour_minor,
                'materials_minor' => $quote->materials_minor,
                'visit_fee_minor' => $quote->visit_fee_minor,
                'total_minor' => $quote->total_minor,
                'commission_minor' => $commission,
                'technician_payout_minor' => $quote->total_minor - $commission,
            ]);

            return $this->transition($booking, BookingStatus::QuoteAccepted, $customer, 'customer', "Customer approved {$quote->reference}.");
        });
    }

    /** The customer declines the revised price: the job ends, the visit fee is due. */
    public function rejectRevisedQuote(Booking $booking, User $customer, ?string $reason = null): Booking
    {
        return DB::transaction(function () use ($booking, $customer, $reason): Booking {
            $booking = $this->lock($booking);
            $quote = $this->pendingQuote($booking);

            $quote->forceFill(['status' => QuoteStatus::Rejected, 'responded_at' => now(), 'rejection_reason' => $reason])->save();
            $visit = (int) $booking->visit_fee_minor;
            $commission = Commission::on($visit);
            $booking->forceFill([
                'labour_minor' => 0,
                'materials_minor' => 0,
                'total_minor' => $visit,
                'commission_minor' => $commission,
                'technician_payout_minor' => $visit - $commission,
                'cancelled_by_user_id' => $customer->id,
                'cancellation_reason' => $reason ?: 'Customer declined the revised price.',
            ]);

            return $this->transition($booking, BookingStatus::Cancelled, $customer, 'customer', 'Customer declined the revised price; visit fee only.');
        });
    }

    /** The customer confirms the work is done and paid in cash. */
    public function confirm(Booking $booking, User $customer): Booking
    {
        if (! in_array('confirm', $this->actionsFor($booking, 'customer'), true)) {
            throw ValidationException::withMessages(['status' => 'This job is not waiting for your confirmation.']);
        }

        return DB::transaction(function () use ($booking, $customer): Booking {
            $booking = $this->lock($booking);
            $booking->forceFill(['payment_status' => PaymentStatus::Paid]);
            $this->transition($booking, BookingStatus::CustomerConfirmed, $customer, 'customer', 'Customer confirmed the job and the cash payment.');

            TechnicianProfile::whereKey($booking->technician_profile_id)->increment('completed_jobs_count');

            return $booking;
        });
    }

    public function cancel(Booking $booking, User $actor, string $role, ?string $reason = null): Booking
    {
        $allowed = in_array('cancel', $this->actionsFor($booking, $role), true);
        if (! $allowed) {
            throw ValidationException::withMessages([
                'status' => $role === 'customer'
                    ? 'The professional is already on the way. Contact PakFix support to cancel.'
                    : 'This job can no longer be cancelled.',
            ]);
        }

        return DB::transaction(function () use ($booking, $actor, $role, $reason): Booking {
            $booking = $this->lock($booking);
            $booking->forceFill([
                'cancelled_by_user_id' => $actor->id,
                'cancellation_reason' => $reason,
                'payment_status' => PaymentStatus::Cancelled,
            ]);
            $this->transition($booking, BookingStatus::Cancelled, $actor, $role, $reason);

            // A professional backing out after accepting counts against them.
            if ($role === 'technician') {
                TechnicianProfile::whereKey($booking->technician_profile_id)->increment('cancelled_jobs_count');
            }

            return $booking;
        });
    }

    /**
     * The single place a status changes: validates the move, stamps the
     * timestamp and appends to the history.
     *
     * @param array<string, mixed> $meta
     */
    public function transition(Booking $booking, BookingStatus $to, User $actor, string $role, ?string $note = null, array $meta = []): Booking
    {
        $from = $booking->status;
        if (! $from->canTransitionTo($to)) {
            throw ValidationException::withMessages([
                'status' => "A job that is {$from->label()} cannot move to {$to->label()}.",
            ]);
        }

        $stamp = match ($to) {
            BookingStatus::TechnicianOnWay => 'on_way_at',
            BookingStatus::Arrived => 'arrived_at',
            BookingStatus::RepairStarted => 'started_at',
            BookingStatus::Completed => 'completed_at',
            BookingStatus::CustomerConfirmed => 'confirmed_at',
            BookingStatus::Cancelled => 'cancelled_at',
            default => null,
        };

        $booking->status = $to;
        if ($stamp !== null) {
            $booking->{$stamp} = now();
        }
        $booking->save();

        $booking->statusHistory()->create([
            'from_status' => $from->value,
            'to_status' => $to->value,
            'changed_by_user_id' => $actor->id,
            'actor_role' => $role,
            'note' => $note,
            'meta' => $meta === [] ? null : $meta,
        ]);
        app(Notifier::class)->bookingChanged($booking, $to, $role);

        return $booking;
    }

    private function lock(Booking $booking): Booking
    {
        return Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
    }

    private function pendingQuote(Booking $booking): Quote
    {
        if ($booking->status !== BookingStatus::QuoteCreated) {
            throw ValidationException::withMessages(['quote' => 'There is no revised price waiting for you.']);
        }

        return Quote::query()
            ->where('booking_id', $booking->id)
            ->where('status', QuoteStatus::Sent->value)
            ->latest('id')
            ->lockForUpdate()
            ->firstOrFail();
    }
}
