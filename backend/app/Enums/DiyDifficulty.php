<?php

declare(strict_types=1);

namespace App\Enums;

/** How hard a fix is for a homeowner, independent of how dangerous it is. */
enum DiyDifficulty: string
{
    case Easy = 'easy';
    case Medium = 'medium';
    case Expert = 'expert';

    public function label(): string
    {
        return match ($this) {
            self::Easy => 'Easy',
            self::Medium => 'Medium',
            self::Expert => 'Expert only',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
