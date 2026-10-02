<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Models\City;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use App\Support\ContentCache;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

/**
 * Which services PakFix can actually deliver in which cities.
 *
 * This is what stops the local SEO pages from being thin: /plumber/lahore
 * only exists when at least one verified, available plumber serves Lahore.
 * A page for a service nobody offers in that city would promise something
 * PakFix cannot do, and search engines rightly treat such pages as spam.
 *
 * Coverage comes from where professionals are based and the service areas
 * they have declared, and only counts professionals who could be booked
 * today.
 */
class CoverageMap
{
    private const CACHE_SECONDS = 900;

    /**
     * Every served city and trade category with at least one professional.
     *
     * @return Collection<int, array{category: ServiceCategory, city: City, professional_count: int}>
     */
    public function localPages(): Collection
    {
        $counts = $this->pairCounts();

        $categories = ServiceCategory::active()->withTrade()->get()->keyBy('id');
        $cities = City::served()->orderBy('sort_order')->get()->keyBy('id');

        return collect($counts)
            ->map(function (int $count, string $pair) use ($categories, $cities) {
                [$categoryId, $cityId] = array_map('intval', explode(':', $pair));

                if (! $categories->has($categoryId) || ! $cities->has($cityId)) {
                    return null;
                }

                return [
                    'category' => $categories[$categoryId],
                    'city' => $cities[$cityId],
                    'professional_count' => $count,
                ];
            })
            ->filter()
            ->sortBy(fn (array $page) => [$page['city']->sort_order, $page['category']->sort_order])
            ->values();
    }

    public function professionalCount(ServiceCategory $category, City $city): int
    {
        return $this->pairCounts()["{$category->id}:{$city->id}"] ?? 0;
    }

    /** Served cities where this category can be booked. @return Collection<int, array{city: City, professional_count: int}> */
    public function citiesFor(ServiceCategory $category): Collection
    {
        return $this->localPagesFor(fn (array $page) => $page['category']->is($category))
            ->map(fn (array $page) => ['city' => $page['city'], 'professional_count' => $page['professional_count']])
            ->values();
    }

    /** Categories that can be booked in this city. @return Collection<int, array{category: ServiceCategory, professional_count: int}> */
    public function categoriesFor(City $city): Collection
    {
        $counts = collect($this->pairCounts())
            ->filter(fn (int $_, string $pair) => (int) explode(':', $pair)[1] === $city->id);

        $categories = ServiceCategory::active()
            ->whereIn('id', $counts->keys()->map(fn (string $pair) => (int) explode(':', $pair)[0]))
            ->orderBy('sort_order')
            ->get();

        return $categories->map(fn (ServiceCategory $category) => [
            'category' => $category,
            'professional_count' => $counts["{$category->id}:{$city->id}"],
        ])->values();
    }

    /** Bookable professionals for a category, optionally narrowed to a city. */
    public function professionals(?ServiceCategory $category = null, ?City $city = null): Builder
    {
        return TechnicianProfile::query()
            ->bookable()
            ->whereHas('user', fn (Builder $q) => $q->where('status', 'active'))
            ->when($category, fn (Builder $q) => $q->forCategory($category->id))
            ->when($city, fn (Builder $q) => $q->inCity($city->id));
    }

    // -----------------------------------------------------------------

    private function localPagesFor(callable $filter): Collection
    {
        return $this->localPages()->filter($filter);
    }

    /**
     * "categoryId:cityId" => number of bookable professionals.
     *
     * Computed in PHP from one query per table rather than a count per pair:
     * a few hundred category and city combinations would otherwise mean a few
     * hundred queries every time the cache is cold.
     *
     * @return array<string, int>
     */
    private function pairCounts(): array
    {
        return ContentCache::remember('coverage:pairs', self::CACHE_SECONDS, function (): array {
            /** @var EloquentCollection<int, TechnicianProfile> $professionals */
            $professionals = $this->professionals()
                ->with([
                    'services' => fn ($q) => $q->where('is_active', true),
                    'serviceAreas' => fn ($q) => $q->where('is_active', true),
                ])
                ->get(['id', 'city_id']);

            $counts = [];

            foreach ($professionals as $professional) {
                $cityIds = $professional->serviceAreas->pluck('city_id')
                    ->push($professional->city_id)
                    ->filter()
                    ->unique();

                $categoryIds = $professional->services->pluck('service_category_id')->unique();

                foreach ($categoryIds as $categoryId) {
                    foreach ($cityIds as $cityId) {
                        $key = "{$categoryId}:{$cityId}";
                        $counts[$key] = ($counts[$key] ?? 0) + 1;
                    }
                }
            }

            return $counts;
        });
    }
}
