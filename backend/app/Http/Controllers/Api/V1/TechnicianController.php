<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\PublicReviewResource;
use App\Http\Resources\V1\TechnicianCardResource;
use App\Http\Resources\V1\TechnicianProfileResource;
use App\Models\City;
use App\Models\Review;
use App\Models\ServiceCategory;
use App\Services\Marketplace\CoverageMap;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The public directory of professionals.
 *
 * Only verified, available professionals with an active account are ever
 * returned. A pending or suspended professional's profile 404s rather than
 * 403s, so the endpoint does not confirm that the account exists.
 */
class TechnicianController extends Controller
{
    public function __construct(private readonly CoverageMap $coverage)
    {
    }

    /**
     * `?city=lahore&category=plumbing&emergency=1&sort=rating|jobs|experience`
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'city' => ['nullable', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:80'],
            'emergency' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'in:rating,jobs,experience'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $city = $request->filled('city')
            ? City::active()->where('slug', $request->string('city'))->first()
            : null;
        $category = $request->filled('category')
            ? ServiceCategory::active()->where('slug', $request->string('category'))->with('parent')->first()
            : null;

        // An unknown filter is an empty result, not "ignore the filter and
        // show everyone", which would be a misleading answer.
        if (($request->filled('city') && ! $city) || ($request->filled('category') && ! $category)) {
            return ApiResponse::success([], 'OK', 200, [
                'pagination' => ['current_page' => 1, 'per_page' => 0, 'total' => 0, 'last_page' => 1, 'has_more' => false],
            ]);
        }

        $query = $this->coverage
            ->professionals($category?->parent ?? $category, $city)
            ->with(['user', 'city', 'services.category'])
            ->when($request->boolean('emergency'), fn ($q) => $q->where('offers_emergency_service', true));

        match ($request->string('sort')->toString()) {
            'jobs' => $query->orderByDesc('completed_jobs_count'),
            'experience' => $query->orderByDesc('years_experience'),
            default => $query->orderByDesc('rating_average')->orderByDesc('rating_count'),
        };

        return ApiResponse::success(
            TechnicianCardResource::collection($query->paginate($request->integer('per_page', 12)))
        );
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $professional = $this->coverage->professionals()
            ->where('slug', $slug)
            ->with([
                'user',
                'city',
                'services' => fn ($q) => $q->where('is_active', true),
                'services.category',
                'serviceAreas' => fn ($q) => $q->where('is_active', true),
                'serviceAreas.city',
                'serviceAreas.area',
                'portfolioItems',
            ])
            ->first();

        if (! $professional) {
            return ApiResponse::notFound('That professional is not available on PakFix.');
        }

        $reviews = Review::published()
            ->where('technician_profile_id', $professional->id)
            ->with('customer')
            ->latest()
            ->limit(10)
            ->get();

        return ApiResponse::success([
            'professional' => (new TechnicianProfileResource($professional))->resolve($request),
            'reviews' => PublicReviewResource::collection($reviews)->resolve($request),
            'rating_breakdown' => $this->ratingBreakdown($professional->id),
        ]);
    }

    /** How many published reviews gave each star rating, 5 down to 1. */
    private function ratingBreakdown(int $technicianProfileId): array
    {
        $counts = Review::published()
            ->where('technician_profile_id', $technicianProfileId)
            ->selectRaw('rating, count(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        return collect([5, 4, 3, 2, 1])
            ->map(fn (int $stars) => ['stars' => $stars, 'count' => (int) ($counts[$stars] ?? 0)])
            ->all();
    }
}
