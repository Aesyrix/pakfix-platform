<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AreaResource;
use App\Http\Resources\V1\BlogPostCardResource;
use App\Http\Resources\V1\PublicReviewResource;
use App\Http\Resources\V1\ServiceCategoryResource;
use App\Http\Resources\V1\TechnicianCardResource;
use App\Models\BlogPost;
use App\Models\City;
use App\Models\Faq;
use App\Models\Review;
use App\Models\ServiceCategory;
use App\Services\Marketplace\CoverageMap;
use App\Support\ApiResponse;
use App\Support\ContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Local SEO pages such as /plumber/lahore and city pages such as /lahore.
 *
 * A local page only exists where CoverageMap says the service can actually
 * be booked, and every one is built from data specific to that city and
 * trade -- its professionals, its areas, its reviews -- so no two pages are
 * the same text with a city name swapped in.
 */
class LocalPageController extends Controller
{
    private const CACHE_TTL = 600;

    public function __construct(private readonly CoverageMap $coverage)
    {
    }

    /** Every local page that should exist. Used for static generation and the sitemap. */
    public function index(): JsonResponse
    {
        $pages = ContentCache::remember('local:index', self::CACHE_TTL, fn () => $this->coverage->localPages()
            ->map(fn (array $page) => [
                'trade_slug' => $page['category']->trade_slug,
                'trade_name' => $page['category']->trade_name,
                'category_slug' => $page['category']->slug,
                'category_name' => $page['category']->name,
                'city_slug' => $page['city']->slug,
                'city_name' => $page['city']->name,
                'professional_count' => $page['professional_count'],
                'path' => "/{$page['category']->trade_slug}/{$page['city']->slug}",
            ])
            ->all());

        return ApiResponse::success($pages);
    }

    public function show(Request $request, string $trade, string $citySlug): JsonResponse
    {
        $payload = ContentCache::remember("local:page:{$trade}:{$citySlug}", self::CACHE_TTL, function () use ($request, $trade, $citySlug): ?array {
            $category = ServiceCategory::active()
                ->where('trade_slug', $trade)
                ->with(['services' => fn ($q) => $q->active()->orderBy('sort_order')])
                ->first();
            $city = City::served()->where('slug', $citySlug)->with(['province', 'areas' => fn ($q) => $q->active()->orderBy('name')])->first();

            if (! $category || ! $city || $this->coverage->professionalCount($category, $city) === 0) {
                return null;
            }

            $professionals = $this->coverage->professionals($category, $city)
                ->with(['user', 'city', 'services.category'])
                ->orderByDesc('rating_average')
                ->limit(12)
                ->get();

            $reviews = Review::published()
                ->whereIn('technician_profile_id', $professionals->pluck('id'))
                ->whereNotNull('comment')
                ->with('customer')
                ->latest()
                ->limit(3)
                ->get();

            return [
                'trade' => ['slug' => $category->trade_slug, 'name' => $category->trade_name],
                'category' => (new ServiceCategoryResource($category))->resolve($request),
                'city' => [
                    'name' => $city->name,
                    'slug' => $city->slug,
                    'province' => $city->province?->name,
                ],
                'professional_count' => $professionals->count(),
                'average_rating' => round((float) $professionals->avg('rating_average'), 1),
                'common_problems' => $category->common_problems ?? [],
                'areas' => AreaResource::collection($city->areas)->resolve($request),
                'professionals' => TechnicianCardResource::collection($professionals)->resolve($request),
                'reviews' => PublicReviewResource::collection($reviews)->resolve($request),
                'faqs' => Faq::active()
                    ->where(fn ($q) => $q->where('service_category_id', $category->id)->orWhere('city_id', $city->id))
                    ->get(['question', 'answer'])
                    ->toArray(),
                'same_trade_other_cities' => $this->coverage->citiesFor($category)
                    ->reject(fn (array $entry) => $entry['city']->is($city))
                    ->map(fn (array $entry) => [
                        'name' => $entry['city']->name,
                        'path' => "/{$category->trade_slug}/{$entry['city']->slug}",
                    ])
                    ->values()
                    ->all(),
                'other_trades_in_city' => $this->coverage->categoriesFor($city)
                    ->reject(fn (array $entry) => $entry['category']->is($category) || ! $entry['category']->trade_slug)
                    ->map(fn (array $entry) => [
                        'name' => $entry['category']->trade_name,
                        'path' => "/{$entry['category']->trade_slug}/{$city->slug}",
                    ])
                    ->values()
                    ->all(),
                'related_posts' => BlogPostCardResource::collection(
                    BlogPost::published()->where('service_category_id', $category->id)->with('category')->latest('published_at')->limit(3)->get()
                )->resolve($request),
            ];
        });

        return $payload === null
            ? ApiResponse::notFound('PakFix does not offer that service in that city yet.')
            : ApiResponse::success($payload);
    }

    /** A city landing page, e.g. /lahore. Served cities only. */
    public function city(Request $request, string $citySlug): JsonResponse
    {
        $payload = ContentCache::remember("local:city:{$citySlug}", self::CACHE_TTL, function () use ($request, $citySlug): ?array {
            $city = City::served()
                ->where('slug', $citySlug)
                ->with(['province', 'areas' => fn ($q) => $q->active()->orderBy('name')])
                ->first();

            if (! $city) {
                return null;
            }

            $professionals = $this->coverage->professionals(null, $city)
                ->with(['user', 'city', 'services.category'])
                ->orderByDesc('rating_average')
                ->limit(6)
                ->get();

            return [
                'city' => [
                    'name' => $city->name,
                    'slug' => $city->slug,
                    'province' => $city->province?->name,
                ],
                'professional_count' => $this->coverage->professionals(null, $city)->count(),
                'categories' => $this->coverage->categoriesFor($city)
                    ->map(fn (array $entry) => [
                        'name' => $entry['category']->name,
                        'slug' => $entry['category']->slug,
                        'icon' => $entry['category']->icon,
                        'professional_count' => $entry['professional_count'],
                        'local_path' => $entry['category']->trade_slug
                            ? "/{$entry['category']->trade_slug}/{$city->slug}"
                            : null,
                    ])
                    ->all(),
                'popular_categories' => ServiceCategoryResource::collection(
                    ServiceCategory::popular()->topLevel()->orderBy('sort_order')->limit(8)->get()
                )->resolve($request),
                'areas' => AreaResource::collection($city->areas)->resolve($request),
                'professionals' => TechnicianCardResource::collection($professionals)->resolve($request),
                'guides' => BlogPostCardResource::collection(
                    BlogPost::published()->with('category')->latest('published_at')->limit(3)->get()
                )->resolve($request),
                'faqs' => Faq::active()
                    ->where(fn ($q) => $q->where('city_id', $city->id)->orWhere(fn ($g) => $g->general()))
                    ->limit(8)
                    ->get(['question', 'answer'])
                    ->toArray(),
            ];
        });

        return $payload === null
            ? ApiResponse::notFound('PakFix is not live in that city yet.')
            : ApiResponse::success($payload);
    }
}
