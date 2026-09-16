<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Http\Resources\Concerns\ResolvesRelations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\City */
class CityResource extends JsonResource
{
    use ResolvesRelations;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_served' => (bool) $this->is_served,
            'province' => $this->whenRelation('province', fn ($province) => [
                'id' => $province->id,
                'name' => $province->name,
                'slug' => $province->slug,
            ]),
            'areas' => $this->relationCollection('areas', AreaResource::class),
        ];
    }
}
