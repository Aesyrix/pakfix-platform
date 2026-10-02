<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Http\Resources\Concerns\ResolvesRelations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin \App\Models\BlogPost */
class BlogPostCardResource extends JsonResource
{
    use ResolvesRelations;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'featured_image_url' => $this->featured_image_path ? Storage::url($this->featured_image_path) : null,
            'featured_image_alt' => $this->featured_image_alt,
            'reading_minutes' => $this->reading_minutes,
            'is_featured' => (bool) $this->is_featured,
            'published_at' => $this->published_at?->toIso8601String(),
            'category' => $this->whenRelation('category', fn ($category) => [
                'name' => $category->name,
                'slug' => $category->slug,
            ]),
        ];
    }
}
