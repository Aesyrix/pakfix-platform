<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * The booking lifecycle. Transitions are enforced in one place
 * (App\Services\Booking\BookingStateMachine) rather than scattered across
 * controllers, and every change is appended to booking_status_history —
 * a booking's past is never overwritten.
 */
enum BookingStatus: string
{
    case Pending = 'pending';
    case SearchingProfessional = 'searching_professional';
    case ProfessionalAssigned = 'professional_assigned';
    case Accepted = 'accepted';
    case Scheduled = 'scheduled';
    case TechnicianOnWay = 'technician_on_way';
    case Arrived = 'arrived';
    case InspectionStarted = 'inspection_started';
    case QuoteCreated = 'quote_created';
    case QuoteAccepted = 'quote_accepted';
    case RepairStarted = 'repair_started';
    case Completed = 'completed';
    case CustomerConfirmed = 'customer_confirmed';
    case Cancelled = 'cancelled';
    case Disputed = 'disputed';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::SearchingProfessional => 'Finding a professional',
            self::ProfessionalAssigned => 'Professional assigned',
            self::Accepted => 'Accepted',
            self::Scheduled => 'Scheduled',
            self::TechnicianOnWay => 'On the way',
            self::Arrived => 'Arrived',
            self::InspectionStarted => 'Inspection started',
            self::QuoteCreated => 'Quote sent',
            self::QuoteAccepted => 'Quote accepted',
            self::RepairStarted => 'Repair in progress',
            self::Completed => 'Completed',
            self::CustomerConfirmed => 'Confirmed by customer',
            self::Cancelled => 'Cancelled',
            self::Disputed => 'Disputed',
            self::Refunded => 'Refunded',
        };
    }

    /** Statuses from which the booking can no longer move forward. */
    public function isTerminal(): bool
    {
        return in_array($this, [self::CustomerConfirmed, self::Cancelled, self::Refunded], true);
    }

    public function isActive(): bool
    {
        return ! $this->isTerminal() && $this !== self::Disputed;
    }

    /**
     * Allowed forward transitions. Cancellation is handled separately
     * because it is reachable from any non-terminal status.
     */
    public function allowedNext(): array
    {
        return match ($this) {
            self::Pending => [self::SearchingProfessional, self::ProfessionalAssigned],
            self::SearchingProfessional => [self::ProfessionalAssigned],
            self::ProfessionalAssigned => [self::Accepted],
            self::Accepted => [self::Scheduled],
            self::Scheduled => [self::TechnicianOnWay],
            self::TechnicianOnWay => [self::Arrived],
            self::Arrived => [self::InspectionStarted],
            self::InspectionStarted => [self::QuoteCreated, self::RepairStarted],
            self::QuoteCreated => [self::QuoteAccepted, self::Cancelled],
            self::QuoteAccepted => [self::RepairStarted],
            self::RepairStarted => [self::Completed],
            self::Completed => [self::CustomerConfirmed, self::Disputed],
            self::CustomerConfirmed => [self::Disputed],
            self::Disputed => [self::Refunded, self::CustomerConfirmed],
            self::Cancelled, self::Refunded => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        if ($next === self::Cancelled) {
            return ! $this->isTerminal();
        }

        return in_array($next, $this->allowedNext(), true);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
