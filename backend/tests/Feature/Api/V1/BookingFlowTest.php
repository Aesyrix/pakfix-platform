<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Booking;
use App\Models\City;
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
 * A booked job from acceptance to confirmation: the professional's steps, the
 * revised price the customer must approve, who may cancel when, and what each
 * side is (and is not) shown.
 */
class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $pro;
    private TechnicianProfile $profile;
    private City $rawalpindi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([LocationSeeder::class, ServiceCategorySeeder::class, RolePermissionSeeder::class, SettingsSeeder::class]);
        $this->rawalpindi = City::where('slug', 'rawalpindi')->firstOrFail();
        $this->customer = $this->user(UserRole::Customer, 'Ayesha Siddiqui');
        [$this->pro, $this->profile] = $this->professional();
    }

    // -----------------------------------------------------------------
    // The happy path
    // -----------------------------------------------------------------

    public function test_the_professional_walks_the_job_and_the_customer_confirms(): void
    {
        $booking = $this->bookedJob(visit: 50000, labour: 200000);

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted')
            ->assertJsonPath('data.actions', ['cancel']);

        $this->actingAs($this->pro)->getJson("/api/v1/pro/bookings/{$booking->uuid}")
            ->assertJsonPath('data.actions', ['on_way', 'cancel']);

        foreach (['on_way' => 'technician_on_way', 'arrived' => 'arrived', 'inspecting' => 'inspection_started', 'working' => 'repair_started', 'completed' => 'completed'] as $step => $status) {
            $this->step($booking, $step)->assertOk()->assertJsonPath('data.status', $status);
        }

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.actions', ['confirm']);

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/confirm")
            ->assertOk()
            ->assertJsonPath('data.status', 'customer_confirmed')
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.total.display', 'Rs 2,500');

        $booking->refresh();
        $this->assertNotNull($booking->on_way_at);
        $this->assertNotNull($booking->arrived_at);
        $this->assertNotNull($booking->completed_at);
        $this->assertNotNull($booking->confirmed_at);
        $this->assertSame(1, (int) $this->profile->refresh()->completed_jobs_count);

        // accepted, scheduled (passed through on the way out), on_way, arrived, inspecting, working, completed, confirmed
        $timeline = array_column($this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")->json('data.timeline'), 'status');
        $this->assertSame(
            ['accepted', 'scheduled', 'technician_on_way', 'arrived', 'inspection_started', 'repair_started', 'completed', 'customer_confirmed'],
            $timeline
        );
    }

    public function test_a_step_out_of_order_is_refused_and_changes_nothing(): void
    {
        $booking = $this->bookedJob();

        $this->step($booking, 'completed')->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->step($booking, 'banana')->assertUnprocessable();
        $this->assertSame('accepted', $booking->refresh()->status->value);
    }

    public function test_the_customer_cannot_confirm_before_the_work_is_done(): void
    {
        $booking = $this->bookedJob();

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/confirm")->assertUnprocessable();
    }

    // -----------------------------------------------------------------
    // Revised price after inspection
    // -----------------------------------------------------------------

    public function test_a_revised_price_needs_the_customers_approval(): void
    {
        $booking = $this->bookedJob(visit: 50000, labour: 200000);
        $this->walkTo($booking, 'inspecting');

        $this->actingAs($this->pro)->getJson("/api/v1/pro/bookings/{$booking->uuid}")
            ->assertJsonPath('data.actions', ['working', 'revised_quote']);

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/revised-quote", [
            'labour_minor' => 300000,
            'materials_minor' => 150000,
            'notes' => 'The trap is cracked and needs replacing.',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'quote_created')
            ->assertJsonPath('data.pending_quote.total.minor', 500000); // visit 500 + 3,000 + 1,500

        // The professional cannot carry on until the customer decides.
        $this->step($booking, 'working')->assertUnprocessable();

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.actions', ['accept_quote', 'reject_quote'])
            ->assertJsonPath('data.pending_quote.notes', 'The trap is cracked and needs replacing.');

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/revised-quote/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'quote_accepted')
            ->assertJsonPath('data.total.minor', 500000)
            ->assertJsonPath('data.pending_quote', null);

        $this->step($booking, 'working')->assertOk()->assertJsonPath('data.status', 'repair_started');
    }

    public function test_declining_the_revised_price_ends_the_job_with_the_visit_fee_only(): void
    {
        $booking = $this->bookedJob(visit: 50000, labour: 200000);
        $this->walkTo($booking, 'inspecting');
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/revised-quote", [
            'labour_minor' => 900000,
            'materials_minor' => 0,
        ])->assertOk();

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/revised-quote/reject", ['reason' => 'Too expensive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.total.minor', 50000)
            ->assertJsonPath('data.labour.minor', 0);
    }

    public function test_a_revised_price_is_only_possible_while_inspecting(): void
    {
        $booking = $this->bookedJob();

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/revised-quote", [
            'labour_minor' => 300000,
            'materials_minor' => 0,
        ])->assertUnprocessable()->assertJsonValidationErrors('quote');
    }

    // -----------------------------------------------------------------
    // Cancelling
    // -----------------------------------------------------------------

    public function test_the_customer_cancels_for_free_until_the_professional_sets_off(): void
    {
        $free = $this->bookedJob();
        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$free->uuid}/cancel", ['reason' => 'Fixed it myself'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $onTheWay = $this->bookedJob();
        $this->step($onTheWay, 'on_way')->assertOk();
        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$onTheWay->uuid}/cancel")
            ->assertUnprocessable()
            ->assertJsonPath('errors.status.0', 'The professional is already on the way. Contact PakFix support to cancel.');
    }

    public function test_a_professional_can_cancel_before_arriving_and_it_counts_against_them(): void
    {
        $booking = $this->bookedJob();
        $this->step($booking, 'on_way')->assertOk();

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/cancel", ['reason' => 'Vehicle broke down'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
        $this->assertSame(1, (int) $this->profile->refresh()->cancelled_jobs_count);

        $arrived = $this->bookedJob();
        $this->walkTo($arrived, 'arrived');
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$arrived->uuid}/cancel", ['reason' => 'Changed my mind'])
            ->assertUnprocessable();
    }

    // -----------------------------------------------------------------
    // What each side sees, and who is kept out
    // -----------------------------------------------------------------

    public function test_each_side_sees_what_it_needs_and_never_a_phone_number(): void
    {
        $booking = $this->bookedJob();

        $customerView = $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")->json('data');
        $this->assertSame($this->profile->uuid, $customerView['professional']['id']);
        $this->assertArrayNotHasKey('customer_first_name', $customerView);

        $proView = $this->actingAs($this->pro)->getJson("/api/v1/pro/bookings/{$booking->uuid}")->json('data');
        $this->assertSame('Ayesha', $proView['customer_first_name']);
        $this->assertSame('House 12, Street 4, Saddar', $proView['address_line']);
        $this->assertNotNull($proView['latitude']);
        $this->assertArrayNotHasKey('professional', $proView);

        foreach ([$customerView, $proView] as $view) {
            $this->assertStringNotContainsString('+923', json_encode($view), 'no phone number may be exposed');
        }
    }

    public function test_other_customers_and_professionals_get_404(): void
    {
        $booking = $this->bookedJob();
        $stranger = $this->user(UserRole::Customer, 'Someone Else');
        [$otherPro] = $this->professional();

        $this->actingAs($stranger)->getJson("/api/v1/bookings/{$booking->uuid}")->assertNotFound();
        $this->actingAs($stranger)->postJson("/api/v1/bookings/{$booking->uuid}/cancel")->assertNotFound();
        $this->actingAs($otherPro)->getJson("/api/v1/pro/bookings/{$booking->uuid}")->assertNotFound();
        $this->actingAs($otherPro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", ['step' => 'on_way'])->assertNotFound();
        $this->actingAs($this->customer)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", ['step' => 'on_way'])->assertForbidden();
    }

    public function test_lists_show_active_jobs_first(): void
    {
        $done = $this->bookedJob();
        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$done->uuid}/cancel")->assertOk();
        $active = $this->bookedJob();

        $this->actingAs($this->customer)->getJson('/api/v1/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.id', $active->uuid)
            ->assertJsonPath('data.1.id', $done->uuid)
            ->assertJsonPath('meta.pagination.total', 2);

        $this->actingAs($this->pro)->getJson('/api/v1/pro/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.id', $active->uuid)
            ->assertJsonPath('data.0.customer_first_name', 'Ayesha');
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    /** Posts a request, has the professional bid, and accepts the bid. */
    private function bookedJob(int $visit = 0, int $labour = 200000): Booking
    {
        $plumbing = ServiceCategory::where('slug', 'plumbing')->firstOrFail();
        $requestId = $this->actingAs($this->customer)->postJson('/api/v1/requests', [
            'service_category_id' => $plumbing->uuid,
            'description' => 'Water is leaking under the kitchen sink and the cabinet floor is wet.',
            'city_id' => $this->rawalpindi->id,
            'address_line' => 'House 12, Street 4, Saddar',
            'latitude' => 33.5973,
            'longitude' => 73.0479,
        ])->assertCreated()->json('data.id');

        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", [
            'visit_fee_minor' => $visit,
            'labour_minor' => $labour,
            'arrival_minutes' => 45,
        ])->assertCreated()->json('data.id');

        $bookingId = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")
            ->assertOk()->json('data.booking.id');

        return Booking::where('uuid', $bookingId)->firstOrFail();
    }

    private function step(Booking $booking, string $step): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", ['step' => $step]);
    }

    private function walkTo(Booking $booking, string $last): void
    {
        foreach (['on_way', 'arrived', 'inspecting', 'working', 'completed'] as $step) {
            $this->step($booking, $step)->assertOk();
            if ($step === $last) {
                return;
            }
        }
    }

    private function user(UserRole $role, string $name): User
    {
        $user = User::factory()->create(['name' => $name]);
        $user->forceFill([
            'phone' => '+923' . str_pad((string) random_int(0, 999999999), 9, '0', STR_PAD_LEFT),
            'status' => 'active',
            'city_id' => $this->rawalpindi->id,
        ])->save();
        $user->assignRole($role->value);

        return $user;
    }

    /** @return array{0: User, 1: TechnicianProfile} */
    private function professional(): array
    {
        $user = $this->user(UserRole::Technician, 'Pro ' . Str::random(5));
        $profile = new TechnicianProfile();
        $profile->forceFill([
            'user_id' => $user->id,
            'slug' => 'pro-' . Str::lower(Str::random(8)),
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
