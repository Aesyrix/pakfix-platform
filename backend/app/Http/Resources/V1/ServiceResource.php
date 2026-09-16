<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Http\Resources\Concerns\ResolvesRelations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Service */
class ServiceResource extends JsonResource
{
    use ResolvesRelations;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'inclusions' => $this->inclusions,
            'exclusions' => $this->exclusions,
            'pricing_model' => $this->pricing_model,
            'base_price_minor' => $this->base_price_minor,
            'visit_fee_minor' => $this->visit_fee_minor,
            'price_display' => $this->hasUpfrontPrice()
                ? 'Rs ' . number_format($this->base_price_minor / 100)
                : 'Quoted after inspection',
            'estimated_minutes' => $this->estimated_minutes,
            'is_emergency' => (bool) $this->is_emergency,
            'category' => $this->whenRelation('category', fn ($category) => [
                'id' => $category->uuid,
                'name' => $category->name,
                'slug' => $category->slug,
            ]),
        ];
    }
}
