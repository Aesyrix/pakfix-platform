<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * A professional's full public profile page.
 *
 * Adds what the listing card leaves out -- the full bio, service areas,
 * availability and portfolio -- while keeping the same privacy rule: nothing
 * that would let someone contact or locate the professional outside PakFix.
 *
 * @mixin \App\Models\TechnicianProfile
 */
class TechnicianProfileResource extends TechnicianCardResource
{
    private const DAY_NAMES = [
        'mon' => 'Monday', 'tue' => 'Tuesday', 'wed' => 'Wednesday', 'thu' => 'Thursday',
        'fri' => 'Friday', 'sat' => 'Saturday', 'sun' => 'Sunday',
    ];

    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'bio' => $this->bio,
            'skills' => $this->skills ?? [],
            'service_radius_km' => $this->service_radius_km,
            'hourly_rate' => $this->hourly_rate_minor === null ? null : [
                'minor' => $this->hourly_rate_minor,
                'display' => 'Rs ' . number_format($this->hourly_rate_minor / 100),
            ],
            'verified_at' => $this->verified_at?->toDateString(),
            'member_since' => $this->created_at?->format('F Y'),
            'service_areas' => $this->relationLoaded('serviceAreas')
                ? $this->serviceAreas
                    ->map(fn ($area) => [
                        'city' => $area->relationLoaded('city') ? $area->city?->name : null,
                        'city_slug' => $area->relationLoaded('city') ? $area->city?->slug : null,
                        'area' => $area->relationLoaded('area') ? $area->area?->name : null,
                    ])
                    ->values()
                    ->all()
                : [],
            // Which days they work, not their hours: enough to plan around
            // without publishing when a home is empty of its tradesperson.
            'working_days' => collect($this->availability ?? [])
                ->filter(fn ($windows) => ! empty($windows))
                ->keys()
                ->map(fn (string $day) => self::DAY_NAMES[$day] ?? ucfirst($day))
                ->values()
                ->all(),
            'portfolio' => $this->relationLoaded('portfolioItems')
                ? $this->portfolioItems
                    ->map(fn ($item) => [
                        'title' => $item->title,
                        'description' => $item->description,
                        'before_url' => $item->before_image_path ? Storage::url($item->before_image_path) : null,
                        'after_url' => $item->after_image_path ? Storage::url($item->after_image_path) : null,
                    ])
                    ->values()
                    ->all()
                : [],
        ]);
    }
}
