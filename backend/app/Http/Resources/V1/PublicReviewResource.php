<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * A review as the public sees it. The author is shown as a first name and an
 * initial -- enough to read as a real person, not enough to identify one.
 *
 * @mixin \App\Models\Review
 */
class PublicReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $name = $this->relationLoaded('customer') ? (string) $this->customer?->name : '';
        $first = Str::before($name, ' ') ?: 'PakFix customer';
        $initial = Str::contains($name, ' ') ? ' ' . Str::upper(Str::substr(Str::afterLast($name, ' '), 0, 1)) . '.' : '';

        return [
            'id' => $this->uuid,
            'rating' => $this->rating,
            'ratings' => [
                'quality' => $this->quality_rating,
                'professionalism' => $this->professionalism_rating,
                'communication' => $this->communication_rating,
                'value' => $this->value_rating,
                'timeliness' => $this->timeliness_rating,
            ],
            'comment' => $this->comment,
            'author' => $first . $initial,
            'is_verified' => (bool) $this->is_verified,
            'response' => $this->response,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
