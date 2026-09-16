<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * The service catalogue PakFix launches with. Categories are data, not code:
 * nothing in the application hardcodes this list, and an admin can add,
 * rename or nest categories without a deploy.
 *
 * Prices are indicative ranges in PKR minor units, shown on marketing pages
 * as a guide. They are never used to charge anyone -- a real price comes from
 * a quote or a fixed-price service.
 */
class ServiceCategorySeeder extends Seeder
{
    /**
     * name, icon, popular, emergency, [typical min, typical max] in rupees,
     * children, and services.
     */
    private function catalogue(): array
    {
        return [
            [
                'name' => 'Plumbing', 'icon' => 'droplet', 'popular' => true,
                'emergency' => true, 'range' => [1500, 8000],
                'description' => 'Leaks, blockages, taps, pipes and water supply problems.',
                'children' => ['Tap & Mixer Repair', 'Drain Unblocking', 'Pipe Leakage', 'Bathroom Fittings'],
                'services' => [
                    ['Leaking tap repair', 'fixed', 1500, 30],
                    ['Blocked drain clearing', 'fixed', 2500, 60],
                    ['Water leakage inspection', 'visit_fee', 1000, 45],
                ],
            ],
            [
                'name' => 'Electrical', 'icon' => 'zap', 'popular' => true,
                'emergency' => true, 'range' => [1500, 12000],
                'description' => 'Wiring, breakers, sockets, lighting and power faults.',
                'children' => ['Wiring & Rewiring', 'Switchboard & Breakers', 'Lighting Installation'],
                'services' => [
                    ['Socket or switch replacement', 'fixed', 1200, 30],
                    ['Breaker tripping diagnosis', 'visit_fee', 1500, 60],
                    ['Light fitting installation', 'fixed', 1800, 45],
                ],
            ],
            [
                'name' => 'AC / HVAC', 'icon' => 'wind', 'popular' => true,
                'emergency' => false, 'range' => [2000, 25000],
                'description' => 'Air conditioner service, gas refilling, installation and repair.',
                'children' => ['AC Service', 'AC Installation', 'AC Gas Refilling', 'AC Repair'],
                'services' => [
                    ['AC general service', 'fixed', 2500, 60],
                    ['AC gas refilling', 'fixed', 6500, 90],
                    ['Split AC installation', 'fixed', 5000, 180],
                    ['AC not cooling diagnosis', 'visit_fee', 1500, 45],
                ],
            ],
            [
                'name' => 'Refrigerator Repair', 'icon' => 'refrigerator', 'popular' => true,
                'emergency' => false, 'range' => [2000, 18000],
                'description' => 'Cooling faults, compressor issues, thermostat and door seals.',
                'services' => [['Refrigerator not cooling', 'visit_fee', 1500, 60]],
            ],
            [
                'name' => 'Washing Machine Repair', 'icon' => 'washing-machine', 'popular' => true,
                'emergency' => false, 'range' => [1500, 12000],
                'description' => 'Drum noise, drainage, spin failure and water inlet faults.',
                'services' => [['Washing machine diagnosis', 'visit_fee', 1200, 60]],
            ],
            [
                'name' => 'Kitchen Appliances', 'icon' => 'microwave',
                'range' => [1500, 15000],
                'description' => 'Ovens, microwaves, hobs, dishwashers and extractor fans.',
                'children' => ['Microwave Repair', 'Oven & Hob Repair', 'Dishwasher Repair'],
            ],
            [
                'name' => 'Water Motor', 'icon' => 'gauge', 'range' => [2000, 20000],
                'description' => 'Suction motors, pressure pumps and booster installation.',
            ],
            [
                'name' => 'Water Tank', 'icon' => 'container', 'range' => [2500, 12000],
                'description' => 'Tank cleaning, leakage sealing and float valve repair.',
                'services' => [['Water tank cleaning', 'fixed', 3500, 120]],
            ],
            [
                'name' => 'Solar System', 'icon' => 'sun', 'range' => [5000, 150000],
                'description' => 'Panel cleaning, inverter faults, wiring and net metering support.',
                'children' => ['Panel Cleaning', 'Inverter Repair', 'Solar Installation'],
                'services' => [['Solar panel cleaning', 'fixed', 4000, 120]],
            ],
            [
                'name' => 'UPS / Inverter', 'icon' => 'battery-charging',
                'range' => [2000, 30000],
                'description' => 'Battery health, charging faults, backup time problems.',
            ],
            [
                'name' => 'Generator', 'icon' => 'fuel', 'emergency' => true,
                'range' => [3000, 40000],
                'description' => 'Servicing, starting faults, fuel system and auto-start panels.',
            ],
            [
                'name' => 'Carpentry', 'icon' => 'hammer', 'range' => [2000, 30000],
                'description' => 'Doors, windows, wardrobes, shelving and wood repairs.',
                'children' => ['Door Repair', 'Wardrobe & Cabinets', 'Window Frames'],
            ],
            [
                'name' => 'Furniture Repair', 'icon' => 'armchair', 'range' => [2000, 25000],
                'description' => 'Polishing, upholstery, joint repair and restoration.',
            ],
            [
                'name' => 'Painting', 'icon' => 'paintbrush', 'popular' => true,
                'range' => [8000, 200000],
                'description' => 'Interior and exterior painting, texture and enamel work.',
                'children' => ['Interior Painting', 'Exterior Painting', 'Texture & Feature Walls'],
            ],
            [
                'name' => 'Wall Repair', 'icon' => 'brick-wall', 'range' => [3000, 40000],
                'description' => 'Cracks, dampness, plaster and patch repairs.',
            ],
            [
                'name' => 'Roof Repair', 'icon' => 'home', 'emergency' => true,
                'range' => [5000, 80000],
                'description' => 'Leakage, slope correction and roof surface treatment.',
            ],
            [
                'name' => 'Waterproofing', 'icon' => 'shield', 'range' => [8000, 120000],
                'description' => 'Roof, bathroom and basement waterproofing treatments.',
            ],
            [
                'name' => 'Pest Control', 'icon' => 'bug', 'popular' => true,
                'range' => [3000, 20000],
                'description' => 'Cockroaches, termites, mosquitoes, rodents and bed bugs.',
                'children' => ['Termite Treatment', 'General Fumigation', 'Rodent Control'],
                'services' => [
                    ['General fumigation', 'fixed', 4500, 90],
                    ['Termite treatment', 'quote_only', null, 180],
                ],
            ],
            [
                'name' => 'Cleaning', 'icon' => 'sparkles', 'popular' => true,
                'range' => [3000, 25000],
                'description' => 'Routine home and office cleaning.',
            ],
            [
                'name' => 'Deep Cleaning', 'icon' => 'spray-can', 'range' => [8000, 45000],
                'description' => 'Full-house deep clean including kitchen and bathrooms.',
                'services' => [['Full home deep clean', 'quote_only', null, 360]],
            ],
            [
                'name' => 'Bathroom Repair', 'icon' => 'shower-head', 'range' => [3000, 60000],
                'description' => 'Fittings, tiles, drainage and complete bathroom renovation.',
            ],
            [
                'name' => 'Kitchen Repair', 'icon' => 'utensils', 'range' => [3000, 80000],
                'description' => 'Counters, cabinets, sinks and kitchen plumbing.',
            ],
            [
                'name' => 'Glass Work', 'icon' => 'square', 'range' => [2000, 40000],
                'description' => 'Glass replacement, shower cabins, mirrors and partitions.',
            ],
            [
                'name' => 'Aluminium Work', 'icon' => 'frame', 'range' => [4000, 60000],
                'description' => 'Aluminium windows, doors and partitions.',
            ],
            [
                'name' => 'Door Locks', 'icon' => 'lock', 'emergency' => true,
                'range' => [1500, 15000],
                'description' => 'Lock replacement, lockouts and digital lock installation.',
                'services' => [['Lock replacement', 'fixed', 2500, 45]],
            ],
            [
                'name' => 'CCTV', 'icon' => 'cctv', 'popular' => true, 'range' => [8000, 120000],
                'description' => 'Camera installation, DVR setup and remote viewing.',
                'children' => ['CCTV Installation', 'CCTV Repair'],
            ],
            [
                'name' => 'Internet / Networking', 'icon' => 'wifi', 'range' => [2000, 40000],
                'description' => 'Router setup, cabling, Wi-Fi coverage and network faults.',
            ],
            [
                'name' => 'Home Security', 'icon' => 'shield-check', 'range' => [5000, 90000],
                'description' => 'Alarms, sensors, intercoms and access control.',
            ],
            [
                'name' => 'Smart Home Installation', 'icon' => 'house-plug',
                'range' => [5000, 150000],
                'description' => 'Smart switches, lighting, thermostats and automation.',
            ],
            [
                'name' => 'Gardening', 'icon' => 'flower', 'range' => [2500, 30000],
                'description' => 'Lawn care, plantation, trimming and landscaping.',
            ],
            [
                'name' => 'Construction', 'icon' => 'crane', 'range' => [50000, 2000000],
                'description' => 'New structures, extensions and major civil work.',
            ],
            [
                'name' => 'Masonry', 'icon' => 'layers', 'range' => [5000, 100000],
                'description' => 'Brickwork, plastering and concrete repairs.',
            ],
            [
                'name' => 'Tiles', 'icon' => 'grid-3x3', 'range' => [8000, 150000],
                'description' => 'Floor and wall tiling, replacement and grouting.',
            ],
            [
                'name' => 'Flooring', 'icon' => 'square-stack', 'range' => [10000, 250000],
                'description' => 'Wooden, vinyl and marble flooring installation and polish.',
            ],
            [
                'name' => 'Ceiling', 'icon' => 'panel-top', 'range' => [8000, 120000],
                'description' => 'Ceiling repair, finishing and water-damage restoration.',
            ],
            [
                'name' => 'False Ceiling', 'icon' => 'panels-top-left', 'range' => [15000, 200000],
                'description' => 'Gypsum and PoP false ceiling design and installation.',
            ],
            [
                'name' => 'Home Renovation', 'icon' => 'construction', 'range' => [100000, 5000000],
                'description' => 'Full or partial home renovation, managed end to end.',
            ],
            [
                'name' => 'Emergency Repair', 'icon' => 'siren', 'popular' => true,
                'emergency' => true, 'range' => [3000, 50000],
                'description' => 'Urgent problems that cannot wait: burst pipes, power failure, lockouts.',
            ],
        ];
    }

    public function run(): void
    {
        $sort = 0;

        foreach ($this->catalogue() as $entry) {
            $category = $this->upsertCategory($entry, null, $sort++);

            $childSort = 0;
            foreach ($entry['children'] ?? [] as $childName) {
                $this->upsertCategory(
                    [
                        'name' => $childName,
                        'icon' => $entry['icon'] ?? null,
                        'emergency' => $entry['emergency'] ?? false,
                        'range' => $entry['range'] ?? null,
                    ],
                    $category->id,
                    $childSort++
                );
            }

            $serviceSort = 0;
            foreach ($entry['services'] ?? [] as [$name, $pricing, $price, $minutes]) {
                Service::updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'service_category_id' => $category->id,
                        'name' => $name,
                        'pricing_model' => $pricing,
                        'base_price_minor' => $price === null ? null : $price * 100,
                        'visit_fee_minor' => $pricing === Service::PRICING_VISIT_FEE
                            ? $price * 100
                            : null,
                        'estimated_minutes' => $minutes,
                        'is_emergency' => $entry['emergency'] ?? false,
                        'is_active' => true,
                        'sort_order' => $serviceSort++,
                        'seo_title' => sprintf('%s in Pakistan | PakFix', $name),
                    ]
                );
            }
        }

        $this->command?->info(sprintf(
            'Seeded %d categories (%d top level) and %d services.',
            ServiceCategory::count(),
            ServiceCategory::whereNull('parent_id')->count(),
            Service::count()
        ));
    }

    private function upsertCategory(array $entry, ?int $parentId, int $sort): ServiceCategory
    {
        [$min, $max] = $entry['range'] ?? [null, null];

        return ServiceCategory::updateOrCreate(
            ['slug' => Str::slug($entry['name'])],
            [
                'parent_id' => $parentId,
                'name' => $entry['name'],
                'description' => $entry['description'] ?? null,
                'icon' => $entry['icon'] ?? null,
                'is_emergency' => $entry['emergency'] ?? false,
                'is_popular' => $entry['popular'] ?? false,
                'is_active' => true,
                'sort_order' => $sort,
                'typical_min_minor' => $min === null ? null : $min * 100,
                'typical_max_minor' => $max === null ? null : $max * 100,
                'seo_title' => sprintf('%s Services in Pakistan | PakFix', $entry['name']),
                'seo_description' => $entry['description'] ?? null,
            ]
        );
    }
}
