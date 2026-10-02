<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BlogPostCardResource;
use App\Http\Resources\V1\BlogPostResource;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Support\ApiResponse;
use App\Support\ContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The public blog. Only published posts whose publish time has arrived are
 * visible; a draft or a post scheduled for tomorrow 404s.
 */
class BlogController extends Controller
{
    private const CACHE_TTL = 600;

    public function categories(Request $request): JsonResponse
    {
        $categories = ContentCache::remember('blog:categories', self::CACHE_TTL, fn () => BlogCategory::active()
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->get()
            ->map(fn (BlogCategory $category) => [
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'post_count' => $category->posts_count,
            ])
            ->all());

        return ApiResponse::success($categories);
    }

    /** `?category=slug&tag=slug&page=` */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category' => ['nullable', 'string', 'max:80'],
            'tag' => ['nullable', 'string', 'max:80'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $posts = BlogPost::published()
            ->with('category')
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category',
                fn ($c) => $c->where('slug', $request->string('category'))
            ))
            ->when($request->filled('tag'), fn ($q) => $q->whereHas(
                'tags',
                fn ($t) => $t->where('slug', $request->string('tag'))
            ))
            ->orderByDesc('is_featured')
            ->latest('published_at')
            ->paginate($request->integer('per_page', 12));

        return ApiResponse::success(BlogPostCardResource::collection($posts));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $payload = ContentCache::remember("blog:post:{$slug}", self::CACHE_TTL, function () use ($request, $slug): ?array {
            $post = BlogPost::published()
                ->where('slug', $slug)
                ->with(['category', 'author', 'tags', 'serviceCategory'])
                ->first();

            if (! $post) {
                return null;
            }

            $related = BlogPost::published()
                ->whereKeyNot($post->getKey())
                ->where(fn ($q) => $q
                    ->where('blog_category_id', $post->blog_category_id)
                    ->when($post->service_category_id, fn ($inner) => $inner->orWhere('service_category_id', $post->service_category_id)))
                ->with('category')
                ->latest('published_at')
                ->limit(3)
                ->get();

            return [
                'post' => (new BlogPostResource($post))->resolve($request),
                'related_posts' => BlogPostCardResource::collection($related)->resolve($request),
            ];
        });

        return $payload === null
            ? ApiResponse::notFound('That article does not exist.')
            : ApiResponse::success($payload);
    }
}
