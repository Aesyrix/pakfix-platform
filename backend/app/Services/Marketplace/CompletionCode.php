<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Models\Booking;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

/**
 * The customer's four-digit completion code.
 *
 * Only the customer sees it. They give it to the professional once the work is
 * done and paid; the professional enters it to finish the job. A correct code
 * is proof the customer agreed the job is complete, so the job is confirmed at
 * once. Wrong guesses are limited per job.
 */
final class CompletionCode
{
    public static function generate(): string
    {
        return str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    /** Bookings made before codes existed get one the first time they are needed. */
    public static function ensure(Booking $booking): string
    {
        if (empty($booking->completion_code)) {
            $booking->forceFill(['completion_code' => self::generate()])->saveQuietly();
        }

        return (string) $booking->completion_code;
    }

    /** Throws unless the code matches; counts wrong attempts. */
    public static function verify(Booking $booking, string $code): void
    {
        $key = "completion-code-attempts:{$booking->id}";
        $limit = (int) config('pakfix.marketplace.completion.code_attempts', 5);

        if ((int) Cache::get($key, 0) >= $limit) {
            throw ValidationException::withMessages([
                'code' => 'Too many wrong codes. Ask the customer to tap "Work done" in their app instead, or try again in an hour.',
            ]);
        }

        if (! hash_equals(self::ensure($booking), trim($code))) {
            Cache::add($key, 0, now()->addHour());
            Cache::increment($key);

            throw ValidationException::withMessages([
                'code' => 'That code is not right. Ask the customer for the code shown on their job screen.',
            ]);
        }

        Cache::forget($key);
    }
}
