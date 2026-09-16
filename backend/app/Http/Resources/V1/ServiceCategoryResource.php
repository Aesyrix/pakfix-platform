<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Http\Resources\Concerns\ResolvesRelations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin \App\Models\ServiceCategory */
class ServiceCategoryResource extends JsonResource
{
    use ResolvesRelations;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'color' => $this->color,
            'image_url' => $this->image_path ? Storage::url($this->image_path) : null,
            'is_emergency' => (bool) $this->is_emergency,
            'is_popular' => (bool) $this->is_popular,
            // Money always crosses the wire as minor units plus a formatted
            // string, so no client has to know PKR formatting rules.
            'typical_price' => $this->when(
                $this->typical_min_minor !== null,
                fn () => [
                    'min_minor' => $this->typical_min_minor,
                    'max_minor' => $this->typical_max_minor,
                    'display' => sprintf(
                        'Rs %s - Rs %s',
                        number_format($this->typical_min_minor / 100),
                        number_format(($this->typical_max_minor ?? $this->typical_min_minor) / 100)
                    ),
                ]
            ),
            'seo' => [
                'title' => $this->seo_title,
                'description' => $this->seo_description,
            ],
            'children' => $this->relationCollection('children', self::class),
            'services' => $this->relationCollection('services', ServiceResource::class),
        ];
    }
}
