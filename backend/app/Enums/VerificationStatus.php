<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Where a technician or company sits in the manual vetting queue.
 * Only Verified professionals are listed publicly.
 */
enum VerificationStatus: string
{
    case NotSubmitted = 'not_submitted';
    case Pending = 'pending';
    case MoreInfoRequested = 'more_info_requested';
    case Verified = 'verified';
    case Rejected = 'rejected';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::NotSubmitted => 'Not submitted',
            self::Pending => 'Under review',
            self::MoreInfoRequested => 'More information needed',
            self::Verified => 'Verified',
            self::Rejected => 'Rejected',
            self::Suspended => 'Suspended',
        };
    }

    /** Whether the professional may appear in search and receive jobs. */
    public function isPubliclyVisible(): bool
    {
        return $this === self::Verified;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
