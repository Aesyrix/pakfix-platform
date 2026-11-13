<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Models\City;
use App\Models\TechnicianProfile;
use Illuminate\Validation\Rule;

/**
 * Where a professional works today. By default jobs are matched (and alerts
 * sent) around their base from their profile. A professional who is somewhere
 * else today (Rawalpindi today, Islamabad tomorrow) can switch:
 *
 *  - here: their current position, sent by the app or website when they tap
 *    "Use my current location" (or each time the app is opened in Pro mode,
 *    when they turned on "Update automatically"). Nothing is tracked in the
 *    background.
 *  - city: the centre of a city PakFix works in, chosen from a list.
 *  - base: back to the base on their profile.
 *
 * Their service radius stays the same; only the centre moves.
 */
class WorkLocation
{
    public const MODES = ['here', 'city', 'base'];

    /** A position is labelled with the nearest city within this distance. */
    private const LABEL_CITY_KM = 60;

    /**
     * Validation rules for `PATCH /pro/work-location`.
     *
     * @return array<string, mixed>
     */
    public static function rules(): array
    {
        return [
            'mode' => ['required_without:follow_location', Rule::in(self::MODES)],
            // Inside Pakistan, like the base on the profile.
            'latitude' => ['required_if:mode,here', 'nullable', 'numeric', 'between:23.5,37.5'],
            'longitude' => ['required_if:mode,here', 'nullable', 'numeric', 'between:60.5,77.9'],
            'city_id' => ['required_if:mode,city', 'nullable', 'integer', Rule::exists('cities', 'id')->where('is_served', 1)->where('is_active', 1)],
            'follow_location' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public static function messages(): array
    {
        return [
            'mode.required_without' => 'Choose where you are working.',
            'latitude.required_if' => 'We could not get your location. Try again.',
            'longitude.required_if' => 'We could not get your location. Try again.',
            'latitude.between' => 'That location is outside Pakistan.',
            'longitude.between' => 'That location is outside Pakistan.',
            'city_id.required_if' => 'Choose a city.',
            'city_id.exists' => 'PakFix is not live in that city yet.',
        ];
    }

    /**
     * Applies validated input and saves the profile.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(TechnicianProfile $profile, array $data): TechnicianProfile
    {
        $mode = $data['mode'] ?? null;

        if ($mode === 'base') {
            $profile->forceFill([
                'work_latitude' => null,
                'work_longitude' => null,
                'work_location_source' => null,
                'work_city_id' => null,
                'work_location_at' => now(),
            ]);
        } elseif ($mode === 'city') {
            $city = City::query()->findOrFail((int) $data['city_id']);
            $profile->forceFill([
                'work_latitude' => $city->latitude,
                'work_longitude' => $city->longitude,
                'work_location_source' => TechnicianProfile::WORK_CITY,
                'work_city_id' => $city->id,
                'work_location_at' => now(),
            ]);
        } elseif ($mode === 'here') {
            $lat = round((float) $data['latitude'], 7);
            $lng = round((float) $data['longitude'], 7);
            $profile->forceFill([
                'work_latitude' => $lat,
                'work_longitude' => $lng,
                'work_location_source' => TechnicianProfile::WORK_HERE,
                'work_city_id' => $this->nearestCity($lat, $lng)?->id,
                'work_location_at' => now(),
            ]);
        }

        if (array_key_exists('follow_location', $data)) {
            $profile->forceFill(['follow_location' => (bool) $data['follow_location']]);
        } elseif ($mode === 'city' || $mode === 'base') {
            // A place they chose: stop replacing it with their position.
            $profile->forceFill(['follow_location' => false]);
        }

        $profile->save();

        return $profile->refresh();
    }

    /** @return array<string, mixed> */
    public function present(TechnicianProfile $profile): array
    {
        $profile->loadMissing(['city', 'workCity']);
        $source = $profile->hasWorkLocation() ? ($profile->work_location_source ?: TechnicianProfile::WORK_HERE) : 'base';

        return [
            // base | here | city
            'source' => $source,
            // The city it is in (or nearest to); null for a position far from any city.
            'city_name' => $source === 'base' ? $profile->city?->name : $profile->workCity?->name,
            'latitude' => $profile->workLatitude(),
            'longitude' => $profile->workLongitude(),
            'updated_at' => $source === 'base' ? null : $profile->work_location_at?->toIso8601String(),
            'follow_location' => (bool) $profile->follow_location,
            'service_radius_km' => app(RequestMatcher::class)->radiusFor($profile),
        ];
    }

    /** The nearest active city within LABEL_CITY_KM, for the label. */
    private function nearestCity(float $lat, float $lng): ?City
    {
        return City::query()
            ->where('is_active', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get(['id', 'name', 'latitude', 'longitude'])
            ->map(fn (City $c) => [$c, $this->km($lat, $lng, (float) $c->latitude, (float) $c->longitude)])
            ->filter(fn (array $p) => $p[1] <= self::LABEL_CITY_KM)
            ->sortBy(fn (array $p) => $p[1])
            ->first()[0] ?? null;
    }

    private function km(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 6371 * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
