<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AreaResource;
use App\Http\Resources\V1\CityResource;
use App\Http\Resources\V1\ProvinceResource;
use App\Models\Area;
use App\Models\City;
use App\Models\Province;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Pakistan's provinces, cities and areas, for address pickers and the local
 * SEO pages. Reference data that changes rarely, so it is cached hard.
 */
class LocationController extends Controller
{
    private const CACHE_TTL = 86400;

    public function provinces(): JsonResponse
    {
        $provinces = Cache::remember(
            'locations:provinces',
            self::CACHE_TTL,
            fn () => Province::active()->with(['cities' => fn ($q) => $q->active()->orderBy('sort_order')])->get()
        );

        return ApiResponse::success(ProvinceResource::collection($provinces));
    }

    /** `?served=1` limits the list to cities PakFix has actually launched in. */
    public function cities(Request $request): JsonResponse
    {
        $servedOnly = $request->boolean('served');

        $cities = Cache::remember(
            'locations:cities:' . ($servedOnly ? 'served' : 'all'),
            self::CACHE_TTL,
            fn () => City::query()
                ->when($servedOnly, fn ($q) => $q->served(), fn ($q) => $q->active())
                ->with('province')
                ->orderBy('sort_order')
                ->get()
        );

        return ApiResponse::success(CityResource::collection($cities));
    }

    public function city(string $slug): JsonResponse
    {
        $city = City::active()
            ->where('slug', $slug)
            ->with(['province', 'areas' => fn ($q) => $q->active()->orderBy('name')])
            ->first();

        if (! $city) {
            return ApiResponse::notFound('We do not have that city on file.');
        }

        return ApiResponse::success(new CityResource($city));
    }

    /** Areas within a city, for the second step of an address picker. */
    public function areas(Request $request, string $citySlug): JsonResponse
    {
        $cityId = City::where('slug', $citySlug)->value('id');

        if (! $cityId) {
            return ApiResponse::notFound('We do not have that city on file.');
        }

        $areas = Area::active()
            ->where('city_id', $cityId)
            ->when(
                $search = $request->string('q')->toString(),
                fn ($q) => $q->where('name', 'like', '%' . $search . '%')
            )
            ->orderBy('name')
            ->get();

        return ApiResponse::success(AreaResource::collection($areas));
    }
}
