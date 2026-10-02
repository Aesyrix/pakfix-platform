<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\PublishesContent;
use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\ServiceCategory;
use App\Support\ApiResponse;
use App\Support\Markdown;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Writing and publishing blog articles.
 *
 * `status` plus `published_at` decide visibility: a post marked published
 * with a future date is scheduled, and appears on its own when the time
 * arrives. Deleting is a soft delete, so an article removed by mistake can
 * be recovered.
 */
class BlogPostController extends Controller
{
    use PublishesContent;

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', 'in:draft,scheduled,published'],
            'q' => ['nullable', 'string', 'max:120'],
        ]);

        $posts = BlogPost::query()
            ->with(['category', 'author'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('q'), fn ($q) => $q->whereRaw(
                'LOWER(title) LIKE ?',
                ['%' . mb_strtolower($request->string('q')->toString()) . '%']
            ))
            ->latest('updated_at')
            ->paginate(20);

        return ApiResponse::success(
            $posts->through(fn (BlogPost $post) => $this->present($post, withBody: false))
        );
    }

    /** Everything the editor needs to render its selects. */
    public function options(): JsonResponse
    {
        return ApiResponse::success([
            'categories' => BlogCategory::orderBy('sort_order')->get(['name', 'slug']),
            'service_categories' => ServiceCategory::active()->topLevel()->orderBy('sort_order')->get(['name', 'slug']),
            'tags' => BlogTag::orderBy('name')->pluck('name'),
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $post = BlogPost::where('uuid', $uuid)->with(['category', 'author', 'tags', 'serviceCategory'])->first();

        return $post
            ? ApiResponse::success($this->present($post))
            : ApiResponse::notFound('That article does not exist.');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['author_id'] = $request->user()->id;
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title']);

        $post = BlogPost::create($data);
        $this->syncTags($post, $request->input('tags', []));

        $this->published('blog_post.created', $post, [], "Created the article \"{$post->title}\"");

        return ApiResponse::created($this->present($post->load(['category', 'author', 'tags', 'serviceCategory'])), 'Article saved.');
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $post = BlogPost::where('uuid', $uuid)->first();

        if (! $post) {
            return ApiResponse::notFound('That article does not exist.');
        }

        $data = $this->validated($request, $post);

        if (isset($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $post->id);
        }

        $original = $post->getOriginal();
        $post->fill($data)->save();

        if ($request->has('tags')) {
            $this->syncTags($post, $request->input('tags', []));
        }

        $this->published('blog_post.updated', $post, $original, "Edited the article \"{$post->title}\"");

        return ApiResponse::success($this->present($post->load(['category', 'author', 'tags', 'serviceCategory'])), 'Article saved.');
    }

    public function destroy(string $uuid): JsonResponse
    {
        $post = BlogPost::where('uuid', $uuid)->first();

        if (! $post) {
            return ApiResponse::notFound('That article does not exist.');
        }

        $post->delete();
        $this->unpublished('blog_post.deleted', $post, "Deleted the article \"{$post->title}\"");

        return ApiResponse::success(null, 'Article deleted.');
    }

    private function validated(Request $request, ?BlogPost $post = null): array
    {
        $required = $post ? 'sometimes' : 'required';

        $data = $request->validate([
            'title' => [$required, 'string', 'min:5', 'max:200'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:160', 'alpha_dash'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => [$required, 'string', 'min:20', 'max:200000'],
            'blog_category_slug' => ['nullable', 'string', 'exists:blog_categories,slug'],
            'service_category_slug' => ['nullable', 'string', 'exists:service_categories,slug'],
            'featured_image_alt' => ['nullable', 'string', 'max:200'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'canonical_url' => ['nullable', 'url:https', 'max:255'],
            'cta_label' => ['nullable', 'string', 'max:60', 'required_with:cta_url'],
            'cta_url' => ['nullable', 'string', 'max:255', 'required_with:cta_label', 'regex:/^(\/[^\s]*|https:\/\/[^\s]+)$/'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => [$required, Rule::in([BlogPost::STATUS_DRAFT, BlogPost::STATUS_SCHEDULED, BlogPost::STATUS_PUBLISHED])],
            'published_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'min:2', 'max:40'],
        ]);

        if ($request->exists('blog_category_slug')) {
            $data['blog_category_id'] = $data['blog_category_slug']
                ? BlogCategory::where('slug', $data['blog_category_slug'])->value('id')
                : null;
        }

        if ($request->exists('service_category_slug')) {
            $data['service_category_id'] = $data['service_category_slug']
                ? ServiceCategory::where('slug', $data['service_category_slug'])->value('id')
                : null;
        }

        // "Scheduled" is just "published, in the future". Store it that way,
        // so there is one visibility rule instead of two.
        $status = $data['status'] ?? $post?->status;
        if (in_array($status, [BlogPost::STATUS_PUBLISHED, BlogPost::STATUS_SCHEDULED], true)) {
            $data['published_at'] = $data['published_at'] ?? $post?->published_at ?? now();
            $data['status'] = BlogPost::STATUS_PUBLISHED;
        }

        if (! isset($data['excerpt']) && isset($data['body']) && ! $post?->excerpt) {
            $data['excerpt'] = Markdown::excerpt($data['body'], 200);
        }

        unset($data['blog_category_slug'], $data['service_category_slug'], $data['tags']);

        return $data;
    }

    private function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source) ?: 'article';
        $slug = $base;
        $suffix = 1;

        while (BlogPost::withTrashed()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = $base . '-' . ++$suffix;
        }

        return $slug;
    }

    private function syncTags(BlogPost $post, array $names): void
    {
        $ids = collect($names)
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->unique(fn (string $name) => Str::slug($name))
            ->map(fn (string $name) => BlogTag::firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id);

        $post->tags()->sync($ids);
    }

    private function present(BlogPost $post, bool $withBody = true): array
    {
        $visibility = match (true) {
            $post->status !== BlogPost::STATUS_PUBLISHED => 'draft',
            $post->published_at?->isFuture() => 'scheduled',
            default => 'published',
        };

        return [
            'id' => $post->uuid,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'body' => $withBody ? $post->body : null,
            'status' => $visibility,
            'published_at' => $post->published_at?->toIso8601String(),
            'is_featured' => (bool) $post->is_featured,
            'reading_minutes' => $post->reading_minutes,
            'blog_category_slug' => $post->relationLoaded('category') ? $post->category?->slug : null,
            'blog_category_name' => $post->relationLoaded('category') ? $post->category?->name : null,
            'service_category_slug' => $post->relationLoaded('serviceCategory') ? $post->serviceCategory?->slug : null,
            'author' => $post->relationLoaded('author') ? $post->author?->name : null,
            'tags' => $post->relationLoaded('tags') ? $post->tags->pluck('name')->all() : [],
            'seo_title' => $post->seo_title,
            'seo_description' => $post->seo_description,
            'canonical_url' => $post->canonical_url,
            'cta_label' => $post->cta_label,
            'cta_url' => $post->cta_url,
            'featured_image_alt' => $post->featured_image_alt,
            'updated_at' => $post->updated_at?->toIso8601String(),
        ];
    }
}
