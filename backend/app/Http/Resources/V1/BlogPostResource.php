<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Support\Markdown;
use Illuminate\Http\Request;

/**
 * A full article. `body_html` is rendered server-side from Markdown with raw
 * HTML stripped, so clients can insert it directly.
 *
 * @mixin \App\Models\BlogPost
 */
class BlogPostResource extends BlogPostCardResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'body_html' => Markdown::toHtml($this->body),
            'author' => $this->whenRelation('author', fn ($author) => ['name' => $author->name]),
            'tags' => $this->relationLoaded('tags')
                ? $this->tags->map(fn ($tag) => ['name' => $tag->name, 'slug' => $tag->slug])->values()->all()
                : [],
            'service_category' => $this->whenRelation('serviceCategory', fn ($category) => [
                'name' => $category->name,
                'slug' => $category->slug,
            ]),
            'cta' => $this->cta_label ? ['label' => $this->cta_label, 'url' => $this->cta_url] : null,
            'seo' => [
                'title' => $this->seo_title ?: $this->title,
                'description' => $this->seo_description ?: Markdown::excerpt($this->body),
                'canonical_url' => $this->canonical_url,
            ],
            'schema_markup' => $this->schema_markup,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ]);
    }
}
