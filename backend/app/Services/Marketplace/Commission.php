<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

/**
 * Platform commission on a job total. Zero during the launch period
 * (PAKFIX_COMMISSION_ENABLED=false); the configured percentage afterwards.
 */
final class Commission
{
    public static function on(int $totalMinor): int
    {
        if (! config('pakfix.marketplace.commission_enabled', false)) {
            return 0;
        }

        return (int) round($totalMinor * (float) config('pakfix.commission.percentage', 10) / 100);
    }
}
