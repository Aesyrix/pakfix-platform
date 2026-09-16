<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * How dangerous a diagnosed problem is. This drives what the AI is permitted
 * to say: at Emergency the assistant must refuse to give repair steps at all
 * and hand the user straight to evacuation guidance plus a professional.
 */
enum SafetyLevel: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Emergency = 'emergency';

    public function label(): string
    {
        return match ($this) {
            self::Low => 'Safe to inspect',
            self::Medium => 'Take care',
            self::High => 'Professional recommended',
            self::Emergency => 'Emergency — do not attempt',
        };
    }

    /** Whether the assistant may offer do-it-yourself instructions. */
    public function allowsDiyGuidance(): bool
    {
        return in_array($this, [self::Low, self::Medium], true);
    }

    /** Whether the problem should be routed as a high-priority request. */
    public function requiresImmediateAttention(): bool
    {
        return $this === self::Emergency;
    }

    public function severity(): int
    {
        return match ($this) {
            self::Low => 1,
            self::Medium => 2,
            self::High => 3,
            self::Emergency => 4,
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
