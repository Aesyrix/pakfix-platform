<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Models\QuoteRequest;
use App\Models\TechnicianProfile;
use Illuminate\Support\Collection;

/**
 * Decides which open requests a professional may see and bid on.
 *
 * A request is in reach when the professional offers its category (or the
 * category's parent, so an "AC / HVAC" pro sees "AC Gas Refilling"), and its
 * location is within the professional's service radius. The database narrows
 * by a bounding box first; the exact great-circle distance is checked in PHP,
 * which keeps the query portable across SQLite, MySQL and PostgreSQL.
 */
class RequestMatcher
{
    private const KM_PER_DEGREE_LAT = 111.32;

    public function radiusFor(TechnicianProfile $profile): int
    {
        $radius = (int) ($profile->service_radius_km ?: config('pakfix.marketplace.default_radius_km', 20));

        return min($radius, (int) config('pakfix.matching.max_radius_km', 50));
    }

    /** @return list<int> Category ids this professional can be matched on. */
    public function categoryIdsFor(TechnicianProfile $profile): array
    {
        return $profile->services()
            ->where('is_active', true)
            ->pluck('service_category_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Open requests in reach, nearest first, each with `distance_km` set.
     *
     * @return Collection<int, QuoteRequest>
     */
    public function nearby(TechnicianProfile $profile, int $limit = 50): Collection
    {
        $categoryIds = $this->categoryIdsFor($profile);
        if ($categoryIds === [] || $profile->latitude === null || $profile->longitude === null) {
            return collect();
        }

        $radius = $this->radiusFor($profile);
        $lat = (float) $profile->latitude;
        $lng = (float) $profile->longitude;
        $dLat = $radius / self::KM_PER_DEGREE_LAT;
        $dLng = $radius / (self::KM_PER_DEGREE_LAT * max(cos(deg2rad($lat)), 0.01));

        return QuoteRequest::query()
            ->acceptingBids()
            ->where('customer_id', '!=', $profile->user_id)
            ->where(fn ($q) => $q
                ->whereIn('service_category_id', $categoryIds)
                ->orWhereHas('category', fn ($c) => $c->whereIn('parent_id', $categoryIds)))
            ->whereBetween('latitude', [$lat - $dLat, $lat + $dLat])
            ->whereBetween('longitude', [$lng - $dLng, $lng + $dLng])
            ->with(['category', 'city', 'area'])
            ->latest()
            ->limit($limit * 2)
            ->get()
            ->map(function (QuoteRequest $request) use ($profile) {
                $request->setAttribute('distance_km', $profile->distanceTo($request->latitude, $request->longitude));

                return $request;
            })
            ->filter(fn (QuoteRequest $r) => $r->distance_km !== null && $r->distance_km <= $radius)
            ->sortBy('distance_km')
            ->take($limit)
            ->values();
    }

    /** Whether this professional is allowed to bid on this request. */
    public function canBid(TechnicianProfile $profile, QuoteRequest $request): bool
    {
        if (! $profile->isVerified() || (int) $request->customer_id === (int) $profile->user_id || ! $request->isAcceptingBids()) {
            return false;
        }

        $categoryIds = $this->categoryIdsFor($profile);
        $request->loadMissing('category');
        $inTrade = in_array((int) $request->service_category_id, $categoryIds, true)
            || in_array((int) $request->category?->parent_id, $categoryIds, true);

        $distance = $profile->distanceTo($request->latitude, $request->longitude);

        return $inTrade && $distance !== null && $distance <= $this->radiusFor($profile);
    }
}
