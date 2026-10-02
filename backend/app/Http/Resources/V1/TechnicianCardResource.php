<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Http\Resources\Concerns\ResolvesRelations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * A professional as shown in a public listing.
 *
 * Public means public: no phone number, no email, no exact base address and
 * no coordinates. A customer reaches a professional through PakFix, which is
 * what protects both sides and keeps the job on the record.
 *
 * @mixin \App\Models\TechnicianProfile
 */
class TechnicianCardResource extends JsonResource
{
    use ResolvesRelations;

    public function toArray(Request $request): array
    {
        $avatar = $this->whenRelation('user', fn ($user) => $user->avatar_path);

        return [
            'id' => $this->uuid,
            'slug' => $this->slug,
            'name' => $this->displayName(),
            'business_name' => $this->business_name,
            'avatar_url' => $avatar ? Storage::url($avatar) : null,
            'headline' => Str::limit((string) $this->bio, 140),
            'city' => $this->whenRelation('city', fn ($city) => [
                'name' => $city->name,
                'slug' => $city->slug,
            ]),
            'is_verified' => $this->isVerified(),
            'years_experience' => $this->years_experience,
            'rating_average' => round((float) $this->rating_average, 1),
            'rating_count' => $this->rating_count,
            'completed_jobs_count' => $this->completed_jobs_count,
            'offers_emergency_service' => (bool) $this->offers_emergency_service,
            'visit_fee' => $this->visit_fee_minor === null ? null : [
                'minor' => $this->visit_fee_minor,
                'display' => 'Rs ' . number_format($this->visit_fee_minor / 100),
            ],
            'languages' => $this->languages ?? [],
            'categories' => $this->relationLoaded('services')
                ? $this->services
                    ->filter(fn ($service) => $service->relationLoaded('category') && $service->category)
                    ->map(fn ($service) => [
                        'name' => $service->category->name,
                        'slug' => $service->category->slug,
                    ])
                    ->unique('slug')
                    ->values()
                    ->all()
                : [],
        ];
    }
}
