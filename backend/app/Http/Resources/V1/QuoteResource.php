<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * One professional's offer, with the money split the customer compares and a
 * small professional card. Contact details are never included.
 *
 * @mixin Quote
 */
class QuoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $money = fn (int $minor) => ['minor' => $minor, 'display' => 'Rs ' . number_format($minor / 100)];

        return [
            'id' => $this->uuid,
            'reference' => $this->reference,
            'status' => $this->status->value,
            'is_actionable' => $this->isActionable(),
            'visit_fee' => $money((int) $this->visit_fee_minor),
            'labour' => $money((int) $this->labour_minor),
            'materials' => $money((int) $this->materials_minor),
            'total' => $money((int) $this->total_minor),
            'arrival_minutes' => $this->available_slots['arrival_minutes'] ?? null,
            'estimated_minutes' => $this->estimated_minutes,
            'notes' => $this->notes,
            'sent_at' => $this->sent_at?->toIso8601String(),
            'responded_at' => $this->responded_at?->toIso8601String(),
            'booking_id' => $this->whenLoaded('booking', fn () => $this->booking?->uuid),
            'request' => $this->whenLoaded('request', fn () => new JobRequestResource($this->request)),
            'professional' => $this->whenLoaded('technicianProfile', function () {
                $p = $this->technicianProfile;
                $avatar = $p->relationLoaded('user') ? $p->user?->avatar_path : null;

                return [
                    'id' => $p->uuid,
                    'slug' => $p->slug,
                    'name' => $p->displayName(),
                    'avatar_url' => $avatar ? Storage::url($avatar) : null,
                    'is_verified' => $p->isVerified(),
                    'rating_average' => round((float) $p->rating_average, 1),
                    'rating_count' => (int) $p->rating_count,
                    'completed_jobs_count' => (int) $p->completed_jobs_count,
                    'years_experience' => $p->years_experience,
                    'city' => $p->relationLoaded('city') ? $p->city?->name : null,
                ];
            }),
        ];
    }
}
