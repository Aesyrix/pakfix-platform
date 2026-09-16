<?php

declare(strict_types=1);

namespace App\Enums;

enum QuoteStatus: string
{
    case Draft = 'draft';
    case Sent = 'sent';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Expired = 'expired';
    case Withdrawn = 'withdrawn';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    /** A quote the customer can still act on. */
    public function isOpen(): bool
    {
        return $this === self::Sent;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
