<?php

declare(strict_types=1);

namespace App\Enums;

enum DisputeStatus: string
{
    case Open = 'open';
    case UnderReview = 'under_review';
    case Resolved = 'resolved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::UnderReview => 'Under review',
            default => ucfirst($this->value),
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
