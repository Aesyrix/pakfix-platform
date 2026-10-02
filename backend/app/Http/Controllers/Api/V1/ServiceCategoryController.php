<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BlogPostCardResource;
use App\Http\Resources\V1\ServiceCategoryResource;
use App\Http\Resources\V1\ServiceResource;
use App\Http\Resources\V1\TechnicianCardResource;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Services\Marketplace\CoverageMap;
use App\Support\ApiResponse;
use App\Support\ContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The public service catalogue. Unauthenticated, and cached through
 * ContentCache so an admin edit invalidates every variant at once.
 */
class ServiceCategoryController extends Controller
{
    private const CACHE_TTL = 600;

    public function __construct(private readonly CoverageMap $coverage)
    {
    }

    /** The category tree. `?flat=1` un-nests; `?popular=1` filters. */
    public function index(Request $request): JsonResponse
    {
        $flat = $request->boolean('flat');
        $popularOnly = $request->boolean('popular');

        $payload = ContentCache::remember(
            sprintf('catalogue:categories:%s:%s', $flat ? 'flat' : 'tree', $popularOnly ? 'popular' : 'all'),
            self::CACHE_TTL,
            function () use ($flat, $popularOnly, $request): array {
                $query = ServiceCategory::active()->orderBy('sort_order');

                if ($popularOnly) {
                    $query->where('is_popular', true)->topLevel();
                } elseif (! $flat) {
                    $query->topLevel()->with(['children' => fn ($q) => $q->active()]);
                }

                return ServiceCategoryResource::collection($query->get())->resolve($request);
            }
        );

        return ApiResponse::success($payload);
    }

    /**
     * Everything a service page renders: the category, its services and
     * problems, where it is available, who offers it, and related guides.
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $payload = ContentCache::remember(
            "catalogue:category:{$slug}",
            self::CACHE_TTL,
            function () use ($slug, $request): ?array {
                $category = ServiceCategory::active()
                    ->where('slug', $slug)
                    ->with([
                        'children' => fn ($q) => $q->active(),
                        'services' => fn ($q) => $q->active()->orderBy('sort_order'),
                        'parent',
                    ])
                    ->first();

                if (! $category) {
                    return null;
                }

                // A subcategory is served by the professionals of its parent.
                $coverageCategory = $category->parent ?? $category;

                $professionals = $this->coverage->professionals($coverageCategory)
                    ->with(['user', 'city', 'services.category'])
                    ->orderByDesc('rating_average')
                    ->orderByDesc('completed_jobs_count')
                    ->limit(6)
                    ->get();

                return [
                    'category' => (new ServiceCategoryResource($category))->resolve($request),
                    'breadcrumb' => $category->breadcrumb(),
                    'parent' => $category->parent ? [
                        'name' => $category->parent->name,
                        'slug' => $category->parent->slug,
                    ] : null,
                    'trade' => $coverageCategory->trade_slug ? [
                        'slug' => $coverageCategory->trade_slug,
                        'name' => $coverageCategory->trade_name,
                    ] : null,
                    'common_problems' => $category->common_problems ?? $coverageCategory->common_problems ?? [],
                    'faqs' => Faq::active()
                        ->where('service_category_id', $coverageCategory->id)
                        ->get(['question', 'answer'])
                        ->toArray(),
                    'cities' => $this->coverage->citiesFor($coverageCategory)
                        ->map(fn (array $entry) => [
                            'name' => $entry['city']->name,
                            'slug' => $entry['city']->slug,
                            'professional_count' => $entry['professional_count'],
                            'local_path' => $coverageCategory->trade_slug
                                ? "/{$coverageCategory->trade_slug}/{$entry['city']->slug}"
                                : null,
                        ])
                        ->all(),
                    'professionals' => TechnicianCardResource::collection($professionals)->resolve($request),
                    'related_posts' => BlogPostCardResource::collection(
                        BlogPost::published()
                            ->where('service_category_id', $coverageCategory->id)
                            ->with('category')
                            ->latest('published_at')
                            ->limit(3)
                            ->get()
                    )->resolve($request),
                ];
            }
        );

        return $payload === null
            ? ApiResponse::notFound('That service does not exist.')
            : ApiResponse::success($payload);
    }

    /** Bookable services, optionally narrowed to one category. */
    public function services(Request $request): JsonResponse
    {
        $query = Service::active()->with('category')->orderBy('sort_order');

        if ($slug = $request->string('category')->toString()) {
            $categoryId = ServiceCategory::where('slug', $slug)->value('id');

            if (! $categoryId) {
                return ApiResponse::notFound('That service category does not exist.');
            }

            $query->where('service_category_id', $categoryId);
        }

        return ApiResponse::success(
            ServiceResource::collection($query->paginate(min(100, max(1, $request->integer('per_page', 25)))))
        );
    }
}
