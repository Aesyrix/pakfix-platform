<?php

declare(strict_types=1);

namespace App\Services\Location;

use App\Models\City;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Turns a point on the map into the place a person recognises: the nearest
 * city (and whether PakFix works there) and a short street address.
 *
 * The street address comes from OpenStreetMap's Nominatim service, called
 * from the server only (never from phones), with PakFix named in the
 * User-Agent as its usage policy asks, a short timeout, and results cached
 * by a ~10 m grid so the same spot is looked up once. Only the coordinates
 * are sent: no name, account or address typed by anyone. When the lookup is
 * off or fails, the address falls back to "Near <city>".
 */
class PlaceFinder
{
    /** A point is in a city when its centre is within this distance. */
    public const CITY_RADIUS_KM = 60;

    /** The nearest active city within CITY_RADIUS_KM, optionally only ones PakFix serves. */
    public function nearestCity(float $lat, float $lng, bool $servedOnly = false): ?City
    {
        return City::query()
            ->where('is_active', true)
            ->when($servedOnly, fn ($q) => $q->where('is_served', true))
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->map(fn (City $c) => [$c, self::km($lat, $lng, (float) $c->latitude, (float) $c->longitude)])
            ->filter(fn (array $p) => $p[1] <= self::CITY_RADIUS_KM)
            ->sortBy(fn (array $p) => $p[1])
            ->first()[0] ?? null;
    }

    /**
     * What to show for a pin: a short address, the city, and whether PakFix
     * takes jobs there.
     *
     * @return array{address: string, area: string|null, city: array{id: int, name: string, is_served: bool}|null, served: bool}
     */
    public function describe(float $lat, float $lng): array
    {
        $city = $this->nearestCity($lat, $lng, servedOnly: true) ?? $this->nearestCity($lat, $lng);
        $street = $this->streetAddress($lat, $lng);

        $address = $street['address'] ?? null;
        if ($address === null || $address === '') {
            $address = $city ? "Near {$city->name}" : 'Pinned location';
        }

        return [
            'address' => $address,
            'area' => $street['area'] ?? null,
            'city' => $city ? ['id' => $city->id, 'name' => $city->name, 'is_served' => (bool) $city->is_served] : null,
            'served' => (bool) $city?->is_served,
        ];
    }

    /** @return array{address: string|null, area: string|null}|null */
    private function streetAddress(float $lat, float $lng): ?array
    {
        if (! config('pakfix.geocoding.enabled', true)) {
            return null;
        }

        // ~10 m grid: neighbours share a lookup, and the cache key holds no exact position.
        $key = sprintf('geo:rev:%.4f:%.4f', $lat, $lng);

        $cached = Cache::get($key);
        if (is_array($cached)) {
            return $cached;
        }

        try {
            $response = Http::timeout((int) config('pakfix.geocoding.timeout', 4))
                ->withHeaders([
                    'User-Agent' => (string) config('pakfix.geocoding.user_agent', 'PakFix/1.0 (+https://pakfix.pk)'),
                    'Accept-Language' => 'en',
                ])
                ->get((string) config('pakfix.geocoding.reverse_url', 'https://nominatim.openstreetmap.org/reverse'), [
                    'format' => 'jsonv2',
                    'lat' => round($lat, 6),
                    'lon' => round($lng, 6),
                    'zoom' => 18,
                    'addressdetails' => 1,
                ]);
        } catch (\Throwable $e) {
            Log::info('Address lookup failed: '.$e->getMessage());

            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $parts = (array) $response->json('address', []);
        $street = trim(implode(' ', array_filter([$parts['house_number'] ?? null, $parts['road'] ?? null])));
        $area = $parts['neighbourhood'] ?? $parts['quarter'] ?? $parts['suburb'] ?? $parts['residential'] ?? $parts['city_district'] ?? null;
        $address = implode(', ', array_values(array_unique(array_filter([$street ?: null, $area]))));

        $result = ['address' => $address !== '' ? mb_substr($address, 0, 200) : null, 'area' => $area];
        Cache::put($key, $result, now()->addDays(30));

        return $result;
    }

    public static function km(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 6371 * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
