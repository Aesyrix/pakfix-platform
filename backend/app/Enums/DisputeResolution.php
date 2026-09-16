<?php

declare(strict_types=1);

namespace App\Enums;

/** What an admin decided at the end of a dispute. */
enum DisputeResolution: string
{
    case NoAction = 'no_action';
    case PartialRefund = 'partial_refund';
    case FullRefund = 'full_refund';
    case TechnicianAdjustment = 'technician_adjustment';
    case AccountCredit = 'account_credit';

    public function label(): string
    {
        return match ($this) {
            self::NoAction => 'No action',
            self::PartialRefund => 'Partial refund',
            self::FullRefund => 'Full refund',
            self::TechnicianAdjustment => 'Technician adjustment',
            self::AccountCredit => 'Account credit',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
