<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\PropertyType;
use App\Enums\UrgencyLevel;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\City;
use App\Models\Company;
use App\Models\CompanyMember;
use App\Models\CustomerProfile;
use App\Models\MaintenanceSchedule;
use App\Models\Property;
use App\Models\PropertyAsset;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use App\Models\TechnicianService;
use App\Models\TechnicianServiceArea;
use App\Models\TechnicianVerification;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Enough real data to open the platform and use it immediately: staff
 * accounts, verified professionals, customers with properties and appliances,
 * and bookings spread across the lifecycle so every dashboard has something
 * true to show.
 *
 * Passwords are the same throughout and are printed at the end. This seeder
 * is for local and staging use; DatabaseSeeder skips it in production.
 */
class DemoDataSeeder extends Seeder
{
    private const PASSWORD = 'password';

    public function run(): void
    {
        $this->createStaff();

        $technicians = $this->createTechnicians();
        $customers = $this->createCustomers();

        $this->createCompany();
        $this->createBookings($customers, $technicians);

        $this->command?->newLine();
        $this->command?->info('Demo accounts (password: ' . self::PASSWORD . ')');
        $this->command?->table(
            ['Role', 'Email'],
            [
                ['Super admin', 'admin@pakfix.pk'],
                ['Support agent', 'support@pakfix.pk'],
                ['Customer', 'ayesha@example.com'],
                ['Customer', 'bilal@example.com'],
                ['Technician', 'ahmed.electrician@example.com'],
                ['Company owner', 'company@coolcare.pk'],
            ]
        );
    }

    // -----------------------------------------------------------------
    // Staff
    // -----------------------------------------------------------------

    private function createStaff(): void
    {
        $this->makeUser(
            'PakFix Admin',
            'admin@pakfix.pk',
            '+923000000001',
            UserRole::SuperAdmin,
            'islamabad'
        );

        $this->makeUser(
            'PakFix Support',
            'support@pakfix.pk',
            '+923000000002',
            UserRole::SupportAgent,
            'lahore'
        );
    }

    // -----------------------------------------------------------------
    // Professionals
    // -----------------------------------------------------------------

    /** @return array<string, TechnicianProfile> */
    private function createTechnicians(): array
    {
        $definitions = [
            [
                'name' => 'Ahmed Raza', 'email' => 'ahmed.electrician@example.com',
                'phone' => '+923001112221', 'city' => 'lahore', 'business' => 'Raza Electric Works',
                'categories' => ['electrical', 'ups-inverter', 'home-security'],
                'experience' => 9, 'rating' => 4.8, 'jobs' => 214, 'emergency' => true,
                'bio' => 'Nine years on residential wiring, breaker panels and backup power across Lahore.',
            ],
            [
                'name' => 'Imran Khalid', 'email' => 'imran.plumber@example.com',
                'phone' => '+923001112222', 'city' => 'lahore', 'business' => 'Khalid Plumbing',
                'categories' => ['plumbing', 'bathroom-repair', 'water-motor'],
                'experience' => 12, 'rating' => 4.6, 'jobs' => 341, 'emergency' => true,
                'bio' => 'Leak detection and bathroom fittings. Same-day call-outs in DHA and Gulberg.',
            ],
            [
                'name' => 'Usman Tariq', 'email' => 'usman.ac@example.com',
                'phone' => '+923001112223', 'city' => 'karachi', 'business' => 'CoolAir Services',
                'categories' => ['ac-hvac', 'refrigerator-repair'],
                'experience' => 7, 'rating' => 4.9, 'jobs' => 508, 'emergency' => false,
                'bio' => 'Split and inverter AC specialist. Gas refilling, servicing and installation.',
            ],
            [
                'name' => 'Fahad Sheikh', 'email' => 'fahad.ac@example.com',
                'phone' => '+923001112224', 'city' => 'islamabad', 'business' => 'Sheikh Climate Care',
                'categories' => ['ac-hvac', 'solar-system'],
                'experience' => 5, 'rating' => 4.4, 'jobs' => 96, 'emergency' => false,
                'bio' => 'AC servicing and solar maintenance for homes in Islamabad and Rawalpindi.',
            ],
            [
                'name' => 'Naveed Anwar', 'email' => 'naveed.carpenter@example.com',
                'phone' => '+923001112225', 'city' => 'islamabad', 'business' => 'Anwar Woodcraft',
                'categories' => ['carpentry', 'furniture-repair', 'door-locks'],
                'experience' => 15, 'rating' => 4.7, 'jobs' => 277, 'emergency' => false,
                'bio' => 'Custom wardrobes, door repairs and furniture restoration.',
            ],
            [
                'name' => 'Zeeshan Ali', 'email' => 'zeeshan.pest@example.com',
                'phone' => '+923001112226', 'city' => 'karachi', 'business' => 'SafeHome Pest Control',
                'categories' => ['pest-control', 'deep-cleaning'],
                'experience' => 6, 'rating' => 4.5, 'jobs' => 183, 'emergency' => false,
                'bio' => 'Licensed fumigation and termite treatment, child and pet safe chemicals.',
            ],
        ];

        $profiles = [];

        foreach ($definitions as $definition) {
            $user = $this->makeUser(
                $definition['name'],
                $definition['email'],
                $definition['phone'],
                UserRole::Technician,
                $definition['city']
            );

            $city = City::where('slug', $definition['city'])->firstOrFail();

            $profile = TechnicianProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'slug' => Str::slug($definition['name'] . '-' . $definition['city']),
                    'business_name' => $definition['business'],
                    'bio' => $definition['bio'],
                    'years_experience' => $definition['experience'],
                    'languages' => ['English', 'Urdu'],
                    'city_id' => $city->id,
                    'base_address' => $city->name,
                    'latitude' => $city->latitude,
                    'longitude' => $city->longitude,
                    'service_radius_km' => 20,
                    'hourly_rate_minor' => 150000,
                    'visit_fee_minor' => 100000,
                    'verification_status' => VerificationStatus::Verified,
                    'verified_at' => now()->subMonths(3),
                    'offers_emergency_service' => $definition['emergency'],
                    'is_available' => true,
                    'is_accepting_jobs' => true,
                    'availability' => [
                        'mon' => [['09:00', '18:00']], 'tue' => [['09:00', '18:00']],
                        'wed' => [['09:00', '18:00']], 'thu' => [['09:00', '18:00']],
                        'fri' => [['09:00', '12:30'], ['14:30', '18:00']],
                        'sat' => [['10:00', '16:00']], 'sun' => [],
                    ],
                    'onboarding_percent' => 100,
                ]
            );

            // Counters are normally maintained by events; seeded directly so
            // the marketplace does not look empty on first run.
            $profile->forceFill([
                'rating_average' => $definition['rating'],
                'rating_count' => (int) round($definition['jobs'] * 0.62),
                'completed_jobs_count' => $definition['jobs'],
                'acceptance_rate' => 88.5,
                'avg_response_minutes' => 24,
            ])->save();

            TechnicianVerification::updateOrCreate(
                ['technician_profile_id' => $profile->id],
                [
                    'status' => VerificationStatus::Verified,
                    'submitted_at' => now()->subMonths(4),
                    'reviewed_at' => now()->subMonths(3),
                ]
            );

            foreach ($definition['categories'] as $slug) {
                $category = ServiceCategory::where('slug', $slug)->first();

                if (! $category) {
                    continue;
                }

                TechnicianService::updateOrCreate(
                    [
                        'technician_profile_id' => $profile->id,
                        'service_category_id' => $category->id,
                        'service_id' => null,
                    ],
                    ['experience_years' => $definition['experience'], 'is_active' => true]
                );
            }

            TechnicianServiceArea::updateOrCreate(
                [
                    'technician_profile_id' => $profile->id,
                    'city_id' => $city->id,
                    'area_id' => null,
                ],
                ['is_active' => true]
            );

            $profiles[$definition['email']] = $profile;
        }

        return $profiles;
    }

    private function createCompany(): void
    {
        $owner = $this->makeUser(
            'CoolCare Services',
            'company@coolcare.pk',
            '+923001113330',
            UserRole::Company,
            'karachi'
        );

        $city = City::where('slug', 'karachi')->firstOrFail();

        $company = Company::updateOrCreate(
            ['slug' => 'coolcare-services'],
            [
                'owner_user_id' => $owner->id,
                'name' => 'CoolCare Services',
                'legal_name' => 'CoolCare Services (Pvt) Ltd',
                'description' => 'Air conditioning and appliance servicing across Karachi, with a team of eleven technicians.',
                'contact_email' => 'hello@coolcare.pk',
                'contact_phone' => '+922134567890',
                'city_id' => $city->id,
                'address_line' => 'Shahrah-e-Faisal, Karachi',
                'latitude' => $city->latitude,
                'longitude' => $city->longitude,
                'verification_status' => VerificationStatus::Verified,
                'verified_at' => now()->subMonths(2),
                'year_founded' => 2019,
                'team_size' => 11,
                'is_active' => true,
            ]
        );

        $company->forceFill([
            'rating_average' => 4.6,
            'rating_count' => 128,
            'completed_jobs_count' => 402,
        ])->save();

        CompanyMember::updateOrCreate(
            ['company_id' => $company->id, 'user_id' => $owner->id],
            [
                'role' => CompanyMember::ROLE_OWNER,
                'job_title' => 'Founder',
                'can_assign_jobs' => true,
                'is_active' => true,
                'joined_at' => now()->subYears(2),
            ]
        );
    }

    // -----------------------------------------------------------------
    // Customers
    // -----------------------------------------------------------------

    /** @return array<string, User> */
    private function createCustomers(): array
    {
        $definitions = [
            [
                'name' => 'Ayesha Siddiqui', 'email' => 'ayesha@example.com',
                'phone' => '+923004445551', 'city' => 'lahore',
                'property' => ['House 214, DHA Phase 5', PropertyType::House, 4, 3],
            ],
            [
                'name' => 'Bilal Ahmed', 'email' => 'bilal@example.com',
                'phone' => '+923004445552', 'city' => 'karachi',
                'property' => ['Flat 7B, Clifton Block 2', PropertyType::Apartment, 2, 2],
            ],
            [
                'name' => 'Sana Malik', 'email' => 'sana@example.com',
                'phone' => '+923004445553', 'city' => 'islamabad',
                'property' => ['House 31, Street 9, F-8/3', PropertyType::House, 5, 4],
            ],
        ];

        $customers = [];

        foreach ($definitions as $definition) {
            $user = $this->makeUser(
                $definition['name'],
                $definition['email'],
                $definition['phone'],
                UserRole::Customer,
                $definition['city']
            );

            $user->forceFill(['onboarding_completed_at' => now()->subMonths(6)])->save();

            CustomerProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'occupancy' => CustomerProfile::OCCUPANCY_OWNER,
                    'interests' => ['repairs', 'maintenance', 'appliance_care'],
                ]
            );

            $city = City::where('slug', $definition['city'])->firstOrFail();
            [$address, $type, $beds, $baths] = $definition['property'];

            $property = Property::updateOrCreate(
                ['user_id' => $user->id, 'address_line' => $address],
                [
                    'name' => 'Home',
                    'type' => $type,
                    'occupancy' => 'owner',
                    'city_id' => $city->id,
                    'latitude' => $city->latitude,
                    'longitude' => $city->longitude,
                    'bedrooms' => $beds,
                    'bathrooms' => $baths,
                    'floors' => $type === PropertyType::Apartment ? 1 : 2,
                    'size_value' => $type === PropertyType::Apartment ? 1600 : 10,
                    'size_unit' => $type === PropertyType::Apartment ? 'sqft' : 'marla',
                    'year_built' => 2016,
                    'is_primary' => true,
                    'is_active' => true,
                ]
            );

            $this->createAssets($property);

            $customers[$definition['email']] = $user;
        }

        return $customers;
    }

    private function createAssets(Property $property): void
    {
        $assets = [
            ['Living room AC', 'ac', 'Haier', 'HSU-18HFCF', 6, 'ac-hvac'],
            ['Refrigerator', 'refrigerator', 'Dawlance', 'DW-560', 12, 'refrigerator-repair'],
            ['Washing machine', 'washing_machine', 'Haier', 'HWM 120', 12, 'washing-machine-repair'],
            ['Water pump', 'water_pump', 'Golden', 'GP-1HP', 6, 'water-motor'],
        ];

        foreach ($assets as [$name, $type, $brand, $model, $months, $categorySlug]) {
            $category = ServiceCategory::where('slug', $categorySlug)->first();

            $asset = PropertyAsset::updateOrCreate(
                ['property_id' => $property->id, 'name' => $name],
                [
                    'service_category_id' => $category?->id,
                    'type' => $type,
                    'brand' => $brand,
                    'model' => $model,
                    'purchase_date' => now()->subYears(2)->startOfMonth(),
                    'warranty_expires_on' => now()->addMonths(4),
                    'last_serviced_on' => now()->subMonths($months - 1),
                    'next_service_due_on' => now()->addMonth(),
                    'service_interval_months' => $months,
                    'is_active' => true,
                ]
            );

            MaintenanceSchedule::updateOrCreate(
                [
                    'property_id' => $property->id,
                    'property_asset_id' => $asset->id,
                    'title' => sprintf('%s service', $name),
                ],
                [
                    'user_id' => $property->user_id,
                    'service_category_id' => $category?->id,
                    'interval_months' => $months,
                    'starts_on' => now()->subMonths($months - 1),
                    'next_due_on' => now()->addMonth(),
                    'reminder_days_before' => 7,
                    'is_active' => true,
                    'is_system_generated' => true,
                ]
            );
        }
    }

    // -----------------------------------------------------------------
    // Bookings
    // -----------------------------------------------------------------

    /**
     * @param  array<string, User>  $customers
     * @param  array<string, TechnicianProfile>  $technicians
     */
    private function createBookings(array $customers, array $technicians): void
    {
        $plan = [
            [
                'customer' => 'ayesha@example.com',
                'technician' => 'ahmed.electrician@example.com',
                'category' => 'electrical',
                'problem' => 'Main breaker trips whenever the iron and the microwave run together.',
                'status' => BookingStatus::CustomerConfirmed,
                'daysAgo' => 21, 'total' => 4500, 'review' => [5, 'Found the fault in twenty minutes and explained it clearly.'],
            ],
            [
                'customer' => 'ayesha@example.com',
                'technician' => 'imran.plumber@example.com',
                'category' => 'plumbing',
                'problem' => 'Kitchen sink drains very slowly and there is water under the cabinet.',
                'status' => BookingStatus::Completed,
                'daysAgo' => 4, 'total' => 2800, 'review' => null,
            ],
            [
                'customer' => 'bilal@example.com',
                'technician' => 'usman.ac@example.com',
                'category' => 'ac-hvac',
                'problem' => 'AC runs but does not cool. Outdoor unit fan is spinning.',
                'status' => BookingStatus::RepairStarted,
                'daysAgo' => 0, 'total' => 6500, 'review' => null,
            ],
            [
                'customer' => 'bilal@example.com',
                'technician' => 'zeeshan.pest@example.com',
                'category' => 'pest-control',
                'problem' => 'Cockroaches in the kitchen despite two sprays last month.',
                'status' => BookingStatus::Scheduled,
                'daysAgo' => -3, 'total' => 4500, 'review' => null,
            ],
            [
                'customer' => 'sana@example.com',
                'technician' => null,
                'category' => 'ac-hvac',
                'problem' => 'Two bedroom ACs need their annual service before summer.',
                'status' => BookingStatus::SearchingProfessional,
                'daysAgo' => 0, 'total' => 0, 'review' => null,
            ],
            [
                'customer' => 'sana@example.com',
                'technician' => 'naveed.carpenter@example.com',
                'category' => 'carpentry',
                'problem' => 'Main bedroom door does not close properly after the monsoon.',
                'status' => BookingStatus::CustomerConfirmed,
                'daysAgo' => 45, 'total' => 3200, 'review' => [4, 'Good work, arrived a little late.'],
            ],
        ];

        foreach ($plan as $entry) {
            $customer = $customers[$entry['customer']] ?? null;
            $category = ServiceCategory::where('slug', $entry['category'])->first();

            if (! $customer || ! $category) {
                continue;
            }

            $property = $customer->properties()->first();
            $technician = $entry['technician'] ? ($technicians[$entry['technician']] ?? null) : null;
            $createdAt = now()->subDays(max($entry['daysAgo'], 0));

            $booking = Booking::updateOrCreate(
                [
                    'customer_id' => $customer->id,
                    'service_category_id' => $category->id,
                    'problem_description' => $entry['problem'],
                ],
                [
                    'property_id' => $property?->id,
                    'service_id' => Service::where('service_category_id', $category->id)->value('id'),
                    'technician_profile_id' => $technician?->id,
                    'status' => $entry['status'],
                    'urgency' => UrgencyLevel::Standard,
                    'booking_type' => Booking::TYPE_SCHEDULE,
                    'contact_name' => $customer->name,
                    'contact_phone' => (string) $customer->phone,
                    'address_line' => (string) $property?->address_line,
                    'city_id' => $property?->city_id ?? City::value('id'),
                    'latitude' => $property?->latitude,
                    'longitude' => $property?->longitude,
                    'preferred_date' => now()->subDays($entry['daysAgo'])->toDateString(),
                    'preferred_time_slot' => 'morning',
                    'scheduled_for' => now()->subDays($entry['daysAgo'])->setTime(11, 0),
                    'payment_method' => 'cash',
                    'payment_status' => $entry['total'] > 0 && $entry['status'] === BookingStatus::CustomerConfirmed
                        ? PaymentStatus::Paid
                        : PaymentStatus::Pending,
                ]
            );

            $this->applyMoney($booking, $entry['total']);
            $this->applyTimestamps($booking, $entry['status'], $createdAt);
            $this->replayHistory($booking, $entry['status']);

            if ($entry['review'] && $technician) {
                [$rating, $comment] = $entry['review'];

                Review::updateOrCreate(
                    ['booking_id' => $booking->id],
                    [
                        'customer_id' => $customer->id,
                        'technician_profile_id' => $technician->id,
                        'rating' => $rating,
                        'quality_rating' => $rating,
                        'professionalism_rating' => $rating,
                        'communication_rating' => $rating,
                        'value_rating' => max(1, $rating - 1),
                        'timeliness_rating' => $rating,
                        'comment' => $comment,
                        'is_verified' => true,
                        'is_published' => true,
                        'would_recommend' => $rating >= 4,
                    ]
                );

                $booking->forceFill(['is_reviewed' => true])->save();
            }
        }

        $this->command?->info(sprintf('Seeded %d demo bookings.', Booking::count()));
    }

    /** Splits a gross total into commission and payout, as the platform would. */
    private function applyMoney(Booking $booking, int $rupees): void
    {
        if ($rupees <= 0) {
            return;
        }

        $total = $rupees * 100;
        $percentage = (float) config('pakfix.commission.percentage', 10);
        $commission = (int) round($total * $percentage / 100);

        $booking->forceFill([
            'labour_minor' => (int) round($total * 0.7),
            'materials_minor' => $total - (int) round($total * 0.7),
            'total_minor' => $total,
            'commission_minor' => $commission,
            'technician_payout_minor' => $total - $commission,
        ])->save();
    }

    private function applyTimestamps(Booking $booking, BookingStatus $status, \Illuminate\Support\Carbon $createdAt): void
    {
        $reached = $this->pathTo($status);
        $stamps = [];
        $cursor = $createdAt->copy();

        $map = [
            BookingStatus::ProfessionalAssigned->value => 'assigned_at',
            BookingStatus::Accepted->value => 'accepted_at',
            BookingStatus::TechnicianOnWay->value => 'on_way_at',
            BookingStatus::Arrived->value => 'arrived_at',
            BookingStatus::RepairStarted->value => 'started_at',
            BookingStatus::Completed->value => 'completed_at',
            BookingStatus::CustomerConfirmed->value => 'confirmed_at',
        ];

        foreach ($reached as $step) {
            $cursor = $cursor->copy()->addMinutes(random_int(20, 90));

            if (isset($map[$step->value])) {
                $stamps[$map[$step->value]] = $cursor->copy();
            }
        }

        $booking->forceFill($stamps + ['created_at' => $createdAt])->save();
    }

    private function replayHistory(Booking $booking, BookingStatus $status): void
    {
        if ($booking->statusHistory()->exists()) {
            return;
        }

        $previous = null;
        $cursor = $booking->created_at?->copy() ?? now();

        foreach ($this->pathTo($status) as $step) {
            BookingStatusHistory::create([
                'booking_id' => $booking->id,
                'from_status' => $previous?->value,
                'to_status' => $step->value,
                'actor_role' => 'system',
                'note' => 'Seeded demo data.',
                'created_at' => $cursor = $cursor->copy()->addMinutes(random_int(20, 90)),
            ]);

            $previous = $step;
        }
    }

    /**
     * The sequence of statuses a booking passed through to reach this one.
     *
     * @return list<BookingStatus>
     */
    private function pathTo(BookingStatus $target): array
    {
        $full = [
            BookingStatus::Pending,
            BookingStatus::SearchingProfessional,
            BookingStatus::ProfessionalAssigned,
            BookingStatus::Accepted,
            BookingStatus::Scheduled,
            BookingStatus::TechnicianOnWay,
            BookingStatus::Arrived,
            BookingStatus::InspectionStarted,
            BookingStatus::RepairStarted,
            BookingStatus::Completed,
            BookingStatus::CustomerConfirmed,
        ];

        $path = [];

        foreach ($full as $status) {
            $path[] = $status;

            if ($status === $target) {
                return $path;
            }
        }

        return [BookingStatus::Pending, $target];
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private function makeUser(
        string $name,
        string $email,
        string $phone,
        UserRole $role,
        string $citySlug
    ): User {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'phone' => $phone,
                'password' => Hash::make(self::PASSWORD),
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'city_id' => City::where('slug', $citySlug)->value('id'),
            ]
        );

        $user->syncRoles([$role->value]);

        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => Str::before($name, ' '),
                'last_name' => Str::after($name, ' '),
            ]
        );

        return $user;
    }
}
