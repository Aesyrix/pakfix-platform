<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Cash is the only method guaranteed to be available; every gateway is
 * resolved through App\Services\Payment\PaymentGatewayInterface and can be
 * switched off from the admin dashboard without touching code.
 */
enum PaymentMethod: string
{
    case Cash = 'cash';
    case BankTransfer = 'bank_transfer';
    case JazzCash = 'jazzcash';
    case Easypaisa = 'easypaisa';
    case Card = 'card';
    case Wallet = 'wallet';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash on service',
            self::BankTransfer => 'Bank transfer',
            self::JazzCash => 'JazzCash',
            self::Easypaisa => 'Easypaisa',
            self::Card => 'Debit / credit card',
            self::Wallet => 'PakFix wallet',
        };
    }

    /** Methods settled outside the platform, needing manual confirmation. */
    public function isOffline(): bool
    {
        return in_array($this, [self::Cash, self::BankTransfer], true);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
