<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * How soon the customer needs someone. Emergency raises the request's
 * priority in the matcher — it is never a promise of a response time.
 */
enum UrgencyLevel: string
{
    case Flexible = 'flexible';
    case Standard = 'standard';
    case Urgent = 'urgent';
    case Emergency = 'emergency';

    public function label(): string
    {
        return match ($this) {
            self::Flexible => 'Whenever suits',
            self::Standard => 'Within a few days',
            self::Urgent => 'Today if possible',
            self::Emergency => 'Emergency',
        };
    }

    public function priority(): int
    {
        return match ($this) {
            self::Flexible => 1,
            self::Standard => 2,
            self::Urgent => 3,
            self::Emergency => 4,
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
