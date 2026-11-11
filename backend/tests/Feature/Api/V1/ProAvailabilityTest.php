<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\City;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use App\Models\TechnicianService;
use App\Models\User;
use App\Services\Marketplace\Availability;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * A professional's working hours, Available switch and emergency opt-in:
 * chosen at sign-up, changed later, and what they decide.
 */
class ProAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    private City $rawalpindi;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([LocationSeeder::class, ServiceCategorySeeder::class, RolePermissionSeeder::class, SettingsSeeder::class]);
        $this->rawalpindi = City::where('slug', 'rawalpindi')->firstOrFail();
    }

    public function test_a_professional_chooses_hours_and_emergencies_at_sign_up(): void
    {
        $token = $this->register([
            'role' => 'technician',
            'work_hours' => 'custom',
            'work_start' => '21:00',
            'work_end' => '06:00',
            'offers_emergency_service' => true,
        ])->assertCreated()->json('data.token');

        $this->withToken($token)->getJson('/api/v1/pro/availability')
            ->assertOk()
            ->assertJsonPath('data.work_hours', 'custom')
            ->assertJsonPath('data.work_start', '21:00')
            ->assertJsonPath('data.work_end', '06:00')
            ->assertJsonPath('data.offers_emergency_service', true)
            ->assertJsonPath('data.is_available', true);
    }

    public function test_an_unverified_professional_is_told_what_to_do_to_receive_jobs(): void
    {
        $token = $this->register(['role' => 'technician'])->assertCreated()->json('data.token');

        $this->withToken($token)->getJson('/api/v1/pro/requests')
            ->assertForbidden()
            ->assertJsonPath('message', 'Complete verification to receive jobs. Add your trades, CNIC and a selfie, and PakFix will review them.');

        TechnicianProfile::query()->update(['verification_status' => VerificationStatus::Pending->value]);
        $this->app['auth']->forgetGuards(); // each real request loads the account fresh
        $this->withToken($token)->getJson('/api/v1/pro/requests')
            ->assertForbidden()
            ->assertJsonPath('message', "We're checking your documents, usually within 24 hours. You'll start receiving jobs once you're verified.");

        // Availability can be set while waiting.
        $this->withToken($token)->patchJson('/api/v1/pro/availability', ['is_available' => false])->assertOk();
    }

    public function test_without_a_choice_a_professional_gets_alerts_any_time(): void
    {
        $token = $this->register(['role' => 'technician'])->assertCreated()->json('data.token');

        $this->withToken($token)->getJson('/api/v1/pro/availability')
            ->assertJsonPath('data.work_hours', 'always')
            ->assertJsonPath('data.offers_emergency_service', false);
    }

    public function test_custom_hours_need_a_start_and_an_end(): void
    {
        $this->register(['role' => 'technician', 'work_hours' => 'custom'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['work_start', 'work_end']);
        $this->register(['role' => 'technician', 'work_hours' => 'custom', 'work_start' => '09:00', 'work_end' => '09:00'])
            ->assertJsonValidationErrors('work_end');
    }

    public function test_a_customer_sign_up_ignores_availability_fields(): void
    {
        $this->register(['role' => 'customer', 'work_hours' => 'morning'])->assertCreated();
        $this->assertSame(0, TechnicianProfile::count());
    }

    public function test_hours_are_pakistan_time_and_can_run_past_midnight(): void
    {
        $availability = app(Availability::class);
        $profile = new TechnicianProfile(['is_available' => true, 'is_accepting_jobs' => true]);
        $at = fn (int $hour) => Carbon::parse('2026-11-12', 'Asia/Karachi')->setTime($hour, 0)->utc();

        $profile->forceFill(['work_hours' => 'morning']);
        $this->assertTrue($availability->isWithinHours($profile, $at(6)));
        $this->assertTrue($availability->isWithinHours($profile, $at(13)));
        $this->assertFalse($availability->isWithinHours($profile, $at(14)));

        $profile->forceFill(['work_hours' => 'evening']);
        $this->assertTrue($availability->isWithinHours($profile, $at(20)));
        $this->assertFalse($availability->isWithinHours($profile, $at(23)));

        $profile->forceFill(['work_hours' => 'custom', 'work_start' => '21:00', 'work_end' => '06:00']);
        $this->assertTrue($availability->isWithinHours($profile, $at(23)));
        $this->assertTrue($availability->isWithinHours($profile, $at(3)));
        $this->assertFalse($availability->isWithinHours($profile, $at(12)));

        $profile->forceFill(['work_hours' => 'always']);
        $this->assertTrue($availability->isWithinHours($profile, $at(3)));
    }

    public function test_a_professional_changes_hours_and_pauses_later(): void
    {
        [$pro] = $this->verifiedPro();

        $this->actingAs($pro)->patchJson('/api/v1/pro/availability', ['work_hours' => 'evening'])
            ->assertOk()
            ->assertJsonPath('data.work_hours', 'evening')
            ->assertJsonPath('data.work_start', '14:00')
            ->assertJsonPath('data.work_end', '22:00');

        $this->actingAs($pro)->patchJson('/api/v1/pro/availability', ['is_available' => false])
            ->assertOk()
            ->assertJsonPath('data.is_available', false)
            ->assertJsonPath('data.receiving_alerts_now', false)
            // The earlier choice is kept when only the switch changes.
            ->assertJsonPath('data.work_hours', 'evening');

        // Pausing alerts does not hide the public profile.
        $this->getJson('/api/v1/technicians')->assertJsonCount(1, 'data');
    }

    public function test_saving_the_profile_keeps_the_emergency_choice(): void
    {
        [$pro] = $this->verifiedPro(emergency: true);
        $this->actingAs($pro)->putJson('/api/v1/pro/profile', [
            'city_id' => $this->rawalpindi->id,
            'category_ids' => [ServiceCategory::where('slug', 'plumbing')->firstOrFail()->uuid],
        ])->assertOk()->assertJsonPath('data.offers_emergency_service', true);
    }

    public function test_emergency_requests_reach_only_professionals_who_opted_in(): void
    {
        [$pro, $profile] = $this->verifiedPro();
        $customer = $this->user(UserRole::Customer, 'Ayesha');
        $requestId = $this->actingAs($customer)->postJson('/api/v1/requests', [
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->uuid,
            'description' => 'A pipe burst in the kitchen and water is flooding the floor.',
            'city_id' => $this->rawalpindi->id,
            'address_line' => 'House 12, Street 4, Saddar',
            'latitude' => 33.5973,
            'longitude' => 73.0479,
            'urgency' => 'emergency',
        ])->assertCreated()->json('data.id');

        $this->actingAs($pro)->getJson('/api/v1/pro/requests')->assertJsonCount(0, 'data');
        $this->actingAs($pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 200000])
            ->assertUnprocessable();

        $profile->forceFill(['offers_emergency_service' => true])->save();
        $pro->unsetRelation('technicianProfile');
        $this->actingAs($pro)->getJson('/api/v1/pro/requests')->assertJsonCount(1, 'data');
        $this->actingAs($pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 200000])
            ->assertCreated();
    }

    // -----------------------------------------------------------------

    /** @param array<string, mixed> $extra */
    private function register(array $extra): TestResponse
    {
        return $this->postJson('/api/v1/auth/register', [
            'name' => 'Bilal Ahmed',
            'email' => 'bilal'.Str::random(4).'@example.com',
            'phone' => '03'.random_int(100000000, 999999999),
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'city_id' => $this->rawalpindi->id,
            'accepts_terms' => true,
            ...$extra,
        ]);
    }

    private function user(UserRole $role, string $name): User
    {
        $user = User::factory()->create(['name' => $name]);
        $user->forceFill([
            'phone' => '+923'.str_pad((string) random_int(0, 999999999), 9, '0', STR_PAD_LEFT),
            'status' => 'active',
            'city_id' => $this->rawalpindi->id,
        ])->save();
        $user->assignRole($role->value);

        return $user;
    }

    /** @return array{0: User, 1: TechnicianProfile} */
    private function verifiedPro(bool $emergency = false): array
    {
        $user = $this->user(UserRole::Technician, 'Pro '.Str::random(5));
        $profile = new TechnicianProfile;
        $profile->forceFill([
            'user_id' => $user->id,
            'slug' => 'pro-'.Str::lower(Str::random(8)),
            'city_id' => $this->rawalpindi->id,
            'latitude' => 33.5651,
            'longitude' => 73.0169,
            'service_radius_km' => 20,
            'verification_status' => VerificationStatus::Verified,
            'is_available' => true,
            'is_accepting_jobs' => true,
            'offers_emergency_service' => $emergency,
        ])->save();
        TechnicianService::create([
            'technician_profile_id' => $profile->id,
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->id,
            'is_active' => true,
        ]);

        return [$user, $profile];
    }
}
