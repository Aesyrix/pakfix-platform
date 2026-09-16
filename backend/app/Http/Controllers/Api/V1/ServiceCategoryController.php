<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ServiceCategoryResource;
use App\Http\Resources\V1\ServiceResource;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * The public service catalogue. These endpoints are unauthenticated and are
 * the ones the marketing site renders from, so they are cached -- the
 * catalogue changes when an admin edits it, not per request.
 */
class ServiceCategoryController extends Controller
{
    private const CACHE_TTL = 3600;

    /** The category tree. `?flat=1` returns every node without nesting. */
    public function index(Request $request): JsonResponse
    {
        $flat = $request->boolean('flat');
        $popularOnly = $request->boolean('popular');

        $categories = Cache::remember(
            sprintf('catalogue:categories:%s:%s', $flat ? 'flat' : 'tree', $popularOnly ? 'popular' : 'all'),
            self::CACHE_TTL,
            function () use ($flat, $popularOnly) {
                $query = ServiceCategory::active()->orderBy('sort_order');

                if ($popularOnly) {
                    $query->where('is_popular', true);
                } elseif (! $flat) {
                    $query->topLevel()->with(['children' => fn ($q) => $q->active()]);
                }

                return $query->get();
            }
        );

        return ApiResponse::success(ServiceCategoryResource::collection($categories));
    }

    /** One category with its subcategories, services and FAQs. */
    public function show(string $slug): JsonResponse
    {
        $category = ServiceCategory::active()
            ->where('slug', $slug)
            ->with([
                'children' => fn ($q) => $q->active(),
                'services' => fn ($q) => $q->active()->orderBy('sort_order'),
                'parent',
            ])
            ->first();

        if (! $category) {
            return ApiResponse::notFound('That service does not exist.');
        }

        return ApiResponse::success([
            'category' => (new ServiceCategoryResource($category))->toArray(request()),
            'breadcrumb' => $category->breadcrumb(),
            'faqs' => $category->relationLoaded('faqs') ? [] : \App\Models\Faq::active()
                ->where('service_category_id', $category->id)
                ->get(['question', 'answer']),
        ]);
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
            ServiceResource::collection($query->paginate($request->integer('per_page', 25)))
        );
    }
}
