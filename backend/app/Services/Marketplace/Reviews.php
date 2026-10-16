<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Review;
use App\Models\TechnicianProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Reviews of a finished job. Only the customer of a confirmed booking can
 * review it, once; the professional gets one reply. A professional's rating
 * is always recomputed from their published reviews, never incremented.
 */
class Reviews
{
    /** @param array<string, mixed> $data Validated input. */
    public function create(Booking $booking, User $customer, array $data): Review
    {
        if ($booking->status !== BookingStatus::CustomerConfirmed || $booking->is_reviewed || $booking->review()->exists()) {
            throw ValidationException::withMessages([
                'review' => 'You can review a job once, after confirming it is done.',
            ]);
        }

        return DB::transaction(function () use ($booking, $customer, $data): Review {
            $review = Review::create([
                'booking_id' => $booking->id,
                'customer_id' => $customer->id,
                'technician_profile_id' => $booking->technician_profile_id,
                'company_id' => $booking->company_id,
                'rating' => (int) $data['rating'],
                'quality_rating' => $data['quality_rating'] ?? null,
                'professionalism_rating' => $data['professionalism_rating'] ?? null,
                'communication_rating' => $data['communication_rating'] ?? null,
                'value_rating' => $data['value_rating'] ?? null,
                'timeliness_rating' => $data['timeliness_rating'] ?? null,
                'comment' => $data['comment'] ?? null,
                'would_recommend' => $data['would_recommend'] ?? null,
                // Written by the customer of a real, finished booking.
                'is_verified' => true,
                'is_published' => true,
            ]);

            $booking->forceFill(['is_reviewed' => true])->save();
            $this->recalculate($booking->technician_profile_id);

            return $review;
        });
    }

    public function respond(Review $review, string $response): Review
    {
        if ($review->response !== null) {
            throw ValidationException::withMessages(['response' => 'You have already replied to this review.']);
        }

        $review->forceFill(['response' => $response, 'responded_at' => now()])->save();

        return $review;
    }

    /** Average and count from published reviews, to one decimal place. */
    public function recalculate(?int $technicianProfileId): void
    {
        if ($technicianProfileId === null) {
            return;
        }

        $stats = Review::query()
            ->published()
            ->where('technician_profile_id', $technicianProfileId)
            ->selectRaw('count(*) as n, avg(rating) as average')
            ->first();

        TechnicianProfile::whereKey($technicianProfileId)->update([
            'rating_count' => (int) ($stats->n ?? 0),
            'rating_average' => round((float) ($stats->average ?? 0), 2),
        ]);
    }
}
