<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Area;
use App\Models\City;
use App\Models\Country;
use App\Models\Province;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Pakistan, its provinces, the cities PakFix cares about, and a starting set
 * of areas for the launch cities. Admins add more areas from the dashboard;
 * this is the floor, not the ceiling.
 *
 * `is_served` marks the cities PakFix has actually launched in. Only those
 * get local SEO landing pages, so an unserved city never produces a page
 * promising professionals who do not exist.
 */
class LocationSeeder extends Seeder
{
    /**
     * province => [city name, latitude, longitude, served]
     *
     * @var array<string, list<array{0: string, 1: float, 2: float, 3: bool}>>
     */
    private const CITIES = [
        'Punjab' => [
            ['Lahore', 31.5204, 74.3587, true],
            ['Rawalpindi', 33.5651, 73.0169, true],
            ['Faisalabad', 31.4187, 73.0791, true],
            ['Multan', 30.1575, 71.5249, true],
            ['Gujranwala', 32.1877, 74.1945, true],
            ['Sialkot', 32.4945, 74.5229, true],
            ['Taxila', 33.7463, 72.7994, false],
            ['Wah Cantt', 33.7715, 72.7414, false],
            ['Bahawalpur', 29.3956, 71.6836, false],
            ['Sargodha', 32.0836, 72.6711, false],
        ],
        'Sindh' => [
            ['Karachi', 24.8607, 67.0011, true],
            ['Hyderabad', 25.3960, 68.3578, true],
            ['Sukkur', 27.7052, 68.8574, false],
            ['Larkana', 27.5590, 68.2120, false],
        ],
        'Khyber Pakhtunkhwa' => [
            ['Peshawar', 34.0151, 71.5249, true],
            ['Abbottabad', 34.1688, 73.2215, true],
            ['Mardan', 34.1989, 72.0231, false],
            ['Swat', 34.7717, 72.3600, false],
        ],
        'Balochistan' => [
            ['Quetta', 30.1798, 66.9750, true],
            ['Gwadar', 25.1264, 62.3225, false],
        ],
        'Islamabad Capital Territory' => [
            ['Islamabad', 33.6844, 73.0479, true],
        ],
    ];

    /**
     * Starting areas for the biggest launch cities.
     *
     * @var array<string, list<string>>
     */
    private const AREAS = [
        'Lahore' => [
            'DHA Phase 1', 'DHA Phase 5', 'Gulberg', 'Model Town', 'Johar Town',
            'Bahria Town', 'Askari 10', 'Cantt', 'Faisal Town', 'Wapda Town',
            'Garden Town', 'Iqbal Town', 'Township', 'Shadman', 'Valencia',
        ],
        'Karachi' => [
            'DHA Phase 6', 'Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad',
            'PECHS', 'Bahadurabad', 'Malir Cantt', 'Gulistan-e-Johar',
            'Korangi', 'Saddar', 'Nazimabad', 'Scheme 33',
        ],
        'Islamabad' => [
            'F-6', 'F-7', 'F-8', 'F-10', 'F-11', 'G-9', 'G-10', 'G-11', 'G-13',
            'E-11', 'I-8', 'DHA Phase 2', 'Bahria Enclave', 'Gulberg Greens',
        ],
        'Rawalpindi' => [
            'Saddar', 'Bahria Town Phase 4', 'Chaklala Scheme 3', 'Satellite Town',
            'Westridge', 'Peshawar Road', 'Gulraiz', 'Adiala Road',
        ],
        'Faisalabad' => [
            'Peoples Colony', 'Madina Town', 'Gulberg', 'Jaranwala Road', 'Susan Road',
        ],
        'Multan' => [
            'Cantt', 'Gulgasht Colony', 'Shah Rukn-e-Alam', 'Bosan Road', 'Model Town',
        ],
        'Peshawar' => [
            'University Town', 'Hayatabad', 'Cantt', 'Gulbahar', 'Warsak Road',
        ],
        'Quetta' => ['Cantt', 'Jinnah Town', 'Satellite Town', 'Samungli Road'],
        'Hyderabad' => ['Latifabad', 'Qasimabad', 'Cantt'],
        'Gujranwala' => ['Model Town', 'Satellite Town', 'DC Colony'],
        'Sialkot' => ['Cantt', 'Model Town', 'Kashmir Road'],
        'Abbottabad' => ['Mandian', 'Supply', 'Jinnahabad'],
    ];

    public function run(): void
    {
        $pakistan = Country::updateOrCreate(
            ['iso2' => 'PK'],
            [
                'name' => 'Pakistan',
                'iso3' => 'PAK',
                'phone_code' => '+92',
                'currency' => 'PKR',
                'is_active' => true,
            ]
        );

        $cityOrder = 0;

        foreach (self::CITIES as $provinceName => $cities) {
            $province = Province::updateOrCreate(
                ['slug' => Str::slug($provinceName)],
                [
                    'country_id' => $pakistan->id,
                    'name' => $provinceName,
                    'is_active' => true,
                ]
            );

            foreach ($cities as [$name, $lat, $lng, $served]) {
                $city = City::updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'province_id' => $province->id,
                        'name' => $name,
                        'latitude' => $lat,
                        'longitude' => $lng,
                        'is_served' => $served,
                        'is_active' => true,
                        // Served cities sort first, so pickers show them first.
                        'sort_order' => ($served ? 0 : 1000) + $cityOrder++,
                    ]
                );

                foreach (self::AREAS[$name] ?? [] as $areaName) {
                    Area::updateOrCreate(
                        ['city_id' => $city->id, 'slug' => Str::slug($areaName)],
                        ['name' => $areaName, 'is_active' => true]
                    );
                }
            }
        }

        $this->command?->info(sprintf(
            'Seeded %d provinces, %d cities (%d served) and %d areas.',
            Province::count(),
            City::count(),
            City::where('is_served', true)->count(),
            Area::count()
        ));
    }
}
