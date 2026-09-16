<?php

declare(strict_types=1);

namespace App\Enums;

enum SupportTicketStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case WaitingCustomer = 'waiting_customer';
    case Resolved = 'resolved';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::InProgress => 'In progress',
            self::WaitingCustomer => 'Waiting on customer',
            default => ucfirst($this->value),
        };
    }

    public function isOpen(): bool
    {
        return ! in_array($this, [self::Resolved, self::Closed], true);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
