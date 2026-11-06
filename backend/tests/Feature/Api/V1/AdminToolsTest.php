<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\City;
use App\Models\DeviceToken;
use App\Models\QuoteRequest;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use App\Models\TechnicianService;
use App\Models\User;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * The admin's people and jobs tools: finding users, suspending and restoring
 * accounts (and everything that must follow from it), clearing strikes, and
 * seeing or cancelling booked jobs.
 */
class AdminToolsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $customer;

    private User $pro;

    private TechnicianProfile $profile;

    private City $rawalpindi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([LocationSeeder::class, ServiceCategorySeeder::class, RolePermissionSeeder::class, SettingsSeeder::class]);
        $this->rawalpindi = City::where('slug', 'rawalpindi')->firstOrFail();
        $this->admin = $this->user(UserRole::Admin, 'Admin Person');
        $this->customer = $this->user(UserRole::Customer, 'Ayesha Siddiqui');
        [$this->pro, $this->profile] = $this->professional();
    }

    public function test_admins_find_customers_and_professionals_but_not_staff(): void
    {
        // Two professionals, so a list (not just one row) is exercised.
        $this->professional();

        $this->actingAs($this->admin)->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonCount(3, 'data');

        $this->actingAs($this->admin)->getJson('/api/v1/admin/users?search=Ayesha')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.role', 'customer');

        $this->actingAs($this->admin)->getJson('/api/v1/admin/users?role=technician')
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.professional.strikes', 0);

        $this->actingAs($this->customer)->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_suspending_a_customer_signs_them_out_everywhere_and_closes_their_requests(): void
    {
        $this->customer->createToken('phone');
        DeviceToken::create(['user_id' => $this->customer->id, 'token' => 'phone-1', 'platform' => 'android']);
        $this->postRequest();

        $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$this->customer->uuid}/suspend", [
            'reason' => 'Abusive messages to professionals.',
        ])->assertOk()->assertJsonPath('data.is_suspended', true);

        $this->assertSame(0, $this->customer->tokens()->count());
        $this->assertSame(0, DeviceToken::where('user_id', $this->customer->id)->count());
        $this->assertSame(0, QuoteRequest::where('status', QuoteRequest::STATUS_OPEN)->count());
        $this->assertTrue(AuditLog::where('action', 'user.suspended')->exists());

        // The professional no longer sees the request.
        $this->actingAs($this->pro)->getJson('/api/v1/pro/requests')->assertJsonCount(0, 'data');

        // Sign-in is refused with the reason, and any session in use stops working.
        $this->postJson('/api/v1/auth/login', ['login' => $this->customer->email, 'password' => 'password'])
            ->assertForbidden()
            ->assertJsonPath('message', 'Abusive messages to professionals.')
            ->assertJsonPath('errors.account.0', 'suspended');
        $this->actingAs($this->customer->fresh())->getJson('/api/v1/bookings')
            ->assertForbidden()
            ->assertJsonPath('errors.account.0', 'suspended');
    }

    public function test_suspending_a_professional_withdraws_their_offers_and_hides_them(): void
    {
        $requestId = $this->postRequest();
        $quoteId = $this->offer($requestId);

        $this->getJson('/api/v1/technicians')->assertJsonCount(1, 'data');

        $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$this->pro->uuid}/suspend", [
            'reason' => 'Fake CNIC.',
        ])->assertOk();

        $this->getJson('/api/v1/technicians')->assertJsonCount(0, 'data');
        $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")->assertUnprocessable();
    }

    public function test_booked_jobs_stay_until_pakfix_cancels_them(): void
    {
        $booking = $this->bookedJob();

        $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$this->pro->uuid}/suspend", ['reason' => 'Fake CNIC.'])->assertOk();
        $this->assertSame('accepted', $booking->fresh()->status->value);

        $this->actingAs($this->admin)->getJson("/api/v1/admin/users/{$this->pro->uuid}")
            ->assertOk()
            ->assertJsonPath('data.active_bookings', 1)
            ->assertJsonPath('data.status_reason', 'Fake CNIC.');

        $this->actingAs($this->admin)->postJson("/api/v1/admin/bookings/{$booking->uuid}/cancel", [
            'reason' => 'The professional was suspended.',
        ])->assertOk()->assertJsonPath('data.status', 'cancelled')->assertJsonPath('data.can_cancel', false);

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.cancellation_reason', 'The professional was suspended.');

        // A finished job cannot be cancelled again.
        $this->actingAs($this->admin)->postJson("/api/v1/admin/bookings/{$booking->uuid}/cancel", ['reason' => 'Again please.'])
            ->assertUnprocessable();
    }

    public function test_a_restored_account_can_sign_in_again(): void
    {
        $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$this->customer->uuid}/suspend", ['reason' => 'Checking something.'])->assertOk();
        $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$this->customer->uuid}/restore")
            ->assertOk()->assertJsonPath('data.is_suspended', false);

        $this->postJson('/api/v1/auth/login', ['login' => $this->customer->email, 'password' => 'password'])->assertOk();
    }

    public function test_admins_cannot_suspend_themselves_or_other_staff(): void
    {
        $other = $this->user(UserRole::Admin, 'Other Admin');

        $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$this->admin->uuid}/suspend", ['reason' => 'Testing myself.'])
            ->assertUnprocessable();
        $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$other->uuid}/suspend", ['reason' => 'Testing staff.'])
            ->assertUnprocessable();
        $this->assertTrue($other->fresh()->canAuthenticate());
    }

    public function test_clearing_strikes_lets_a_professional_send_offers_again(): void
    {
        $this->profile->forceFill(['strikes_count' => 3])->save();
        $requestId = $this->postRequest();

        $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$this->pro->uuid}/clear-strikes", ['note' => 'Strikes were a mistake.'])
            ->assertOk()->assertJsonPath('data.professional.strikes', 0);

        $this->pro->unsetRelation('technicianProfile');
        $this->offer($requestId);
    }

    public function test_admins_see_and_search_booked_jobs(): void
    {
        $booking = $this->bookedJob();

        $this->actingAs($this->admin)->getJson('/api/v1/admin/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.reference', $booking->reference)
            ->assertJsonPath('data.0.customer.name', 'Ayesha Siddiqui');
        $this->actingAs($this->admin)->getJson('/api/v1/admin/bookings?status=finished')->assertJsonCount(0, 'data');
        $this->actingAs($this->admin)->getJson('/api/v1/admin/bookings?search='.$booking->reference)->assertJsonCount(1, 'data');
        $this->actingAs($this->admin)->getJson("/api/v1/admin/bookings/{$booking->uuid}")
            ->assertOk()
            ->assertJsonPath('data.can_cancel', true)
            ->assertJsonPath('data.timeline.0.status', 'accepted');

        $this->actingAs($this->customer)->getJson('/api/v1/admin/bookings')->assertForbidden();
    }

    public function test_the_overview_tells_the_website_which_tools_to_show(): void
    {
        $this->actingAs($this->admin)->getJson('/api/v1/admin/overview')
            ->assertOk()
            ->assertJsonPath('data.permissions.users', true)
            ->assertJsonPath('data.permissions.manage_users', true)
            ->assertJsonPath('data.permissions.bookings', true);
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private function postRequest(): string
    {
        return $this->actingAs($this->customer)->postJson('/api/v1/requests', [
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->uuid,
            'description' => 'Water is leaking under the kitchen sink and the cabinet floor is wet.',
            'city_id' => $this->rawalpindi->id,
            'address_line' => 'House 12, Street 4, Saddar',
            'latitude' => 33.5973,
            'longitude' => 73.0479,
        ])->assertCreated()->json('data.id');
    }

    private function offer(string $requestId): string
    {
        return $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", [
            'labour_minor' => 200000,
            'arrival_minutes' => 45,
        ])->assertCreated()->json('data.id');
    }

    private function bookedJob(): Booking
    {
        $quoteId = $this->offer($this->postRequest());
        $bookingId = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")->assertOk()->json('data.booking.id');

        return Booking::where('uuid', $bookingId)->firstOrFail();
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
    private function professional(): array
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
        ])->save();

        TechnicianService::create([
            'technician_profile_id' => $profile->id,
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->id,
            'is_active' => true,
        ]);

        return [$user, $profile];
    }
}
