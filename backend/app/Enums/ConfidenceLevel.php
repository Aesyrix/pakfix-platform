<?php

declare(strict_types=1);

namespace App\Enums;

/** How sure the model is about a diagnosis. Shown to the customer verbatim. */
enum ConfidenceLevel: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
