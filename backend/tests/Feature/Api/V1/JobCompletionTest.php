<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Booking;
use App\Models\City;
use App\Models\Dispute;
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
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * Finishing a job so neither side can dodge it: the customer's completion
 * code, the customer marking it done, automatic completion and confirmation,
 * location records, disputes decided by PakFix, and strikes.
 */
class JobCompletionTest extends TestCase
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

    public function test_only_the_customer_sees_the_completion_code_until_the_job_is_finished(): void
    {
        $booking = $this->bookedJob();
        $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $booking->completion_code);

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.completion_code', $booking->completion_code);
        $this->actingAs($this->pro)->getJson("/api/v1/pro/bookings/{$booking->uuid}")
            ->assertJsonPath('data.completion_code', null);

        $this->walkTo($booking, 'working');
        $this->complete($booking, $booking->completion_code)->assertOk();

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.completion_code', null);
    }

    public function test_the_customers_code_confirms_the_job_at_once(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'working');

        $this->complete($booking, $booking->completion_code)
            ->assertOk()
            ->assertJsonPath('data.status', 'customer_confirmed')
            ->assertJsonPath('data.completed_via', 'code')
            ->assertJsonPath('data.payment_status', 'paid');

        $this->assertSame(1, (int) $this->profile->fresh()->completed_jobs_count);
    }

    public function test_a_wrong_code_changes_nothing_and_guesses_are_limited(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'working');
        $wrong = $booking->completion_code === '0000' ? '1111' : '0000';

        for ($i = 0; $i < 5; $i++) {
            $this->complete($booking, $wrong)->assertUnprocessable()->assertJsonValidationErrors('code');
        }
        $this->assertSame('repair_started', $booking->fresh()->status->value);

        // Locked out now, even with the right code.
        $this->complete($booking, $booking->completion_code)->assertUnprocessable()->assertJsonValidationErrors('code');
    }

    public function test_without_the_code_the_customer_confirms_later(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'working');

        $this->complete($booking)->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.completed_via', 'professional');

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.actions', ['confirm', 'dispute']);
    }

    public function test_the_customer_can_mark_the_job_done_if_the_professional_does_not(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'on_way');

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.actions', ['mark_done']);

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/done")
            ->assertOk()
            ->assertJsonPath('data.status', 'customer_confirmed')
            ->assertJsonPath('data.completed_via', 'customer');

        $this->assertSame(1, (int) $this->profile->fresh()->completed_jobs_count);
    }

    public function test_a_job_cannot_be_marked_done_before_the_professional_sets_off(): void
    {
        $booking = $this->bookedJob();

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/done")->assertUnprocessable();
        $this->assertSame('accepted', $booking->fresh()->status->value);
    }

    public function test_a_job_left_in_progress_is_marked_done_then_confirmed_automatically(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'working');

        $this->travel(71)->hours();
        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.status', 'repair_started');

        $this->travel(2)->hours();
        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.completed_via', 'auto');

        $this->travel(73)->hours();
        $this->artisan('pakfix:settle-jobs')->assertSuccessful();
        $this->assertSame('customer_confirmed', $booking->fresh()->status->value);
        $this->assertSame(1, (int) $this->profile->fresh()->completed_jobs_count);
    }

    public function test_an_open_dispute_stops_automatic_confirmation(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'working');
        $this->complete($booking)->assertOk();

        $this->dispute($booking, 'problem')->assertOk()->assertJsonPath('data.status', 'disputed')
            ->assertJsonPath('data.dispute.kind', 'problem')
            ->assertJsonPath('data.actions', []);

        $this->travel(10)->days();
        $this->artisan('pakfix:settle-jobs')->assertSuccessful();
        $this->assertSame('disputed', $booking->fresh()->status->value);
    }

    public function test_pakfix_decides_a_dispute_and_can_give_a_strike(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'working');
        $this->complete($booking)->assertOk();
        $this->dispute($booking, 'problem')->assertOk();
        $dispute = Dispute::firstOrFail();

        $admin = $this->user(UserRole::Admin, 'Admin Person');
        $this->actingAs($admin)->getJson('/api/v1/admin/disputes')
            ->assertOk()
            ->assertJsonPath('data.0.reference', $dispute->reference)
            ->assertJsonPath('data.0.booking.professional.strikes', 0);

        $this->actingAs($this->customer)->getJson('/api/v1/admin/disputes')->assertForbidden();

        $this->actingAs($admin)->patchJson("/api/v1/admin/disputes/{$dispute->uuid}", [
            'outcome' => 'cancel', 'strike' => true, 'note' => 'The work was not done.',
        ])->assertOk()->assertJsonPath('data.status', 'resolved')->assertJsonPath('data.outcome', 'cancel');

        $this->assertSame('cancelled', $booking->fresh()->status->value);
        $this->assertSame(1, (int) $this->profile->fresh()->strikes_count);

        // Decided once only.
        $this->actingAs($admin)->patchJson("/api/v1/admin/disputes/{$dispute->uuid}", [
            'outcome' => 'complete', 'note' => 'Again.',
        ])->assertUnprocessable();
    }

    public function test_a_dispute_decided_for_the_professional_completes_the_job(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'working');
        $this->complete($booking)->assertOk();

        // The customer is not confirming: the professional raises it.
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/dispute", [
            'kind' => 'not_paid', 'description' => 'The customer has not paid for the finished work.',
        ])->assertOk()->assertJsonPath('data.status', 'disputed');

        $admin = $this->user(UserRole::Admin, 'Admin Person');
        $this->actingAs($admin)->patchJson('/api/v1/admin/disputes/'.Dispute::firstOrFail()->uuid, [
            'outcome' => 'complete', 'note' => 'Photos show the work was done.',
        ])->assertOk();

        $this->assertSame('customer_confirmed', $booking->fresh()->status->value);
        $this->assertSame(1, (int) $this->profile->fresh()->completed_jobs_count);
    }

    public function test_a_confirmed_job_can_be_disputed_only_within_the_window(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'working');
        $this->complete($booking, $booking->completion_code)->assertOk();

        $this->travel(73)->hours();
        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.actions', ['review']);
        $this->dispute($booking, 'problem')->assertUnprocessable();
    }

    public function test_a_no_show_can_be_reported_once_the_professional_is_late(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'on_way');

        $this->dispute($booking, 'no_show')->assertUnprocessable();

        $this->travel(181)->minutes();
        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")
            ->assertJsonPath('data.actions', ['mark_done', 'no_show']);
        $this->dispute($booking, 'no_show')->assertOk()->assertJsonPath('data.dispute.kind', 'no_show');
    }

    public function test_arriving_and_finishing_record_the_professionals_position(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'on_way');

        // At the address, then about 5 km away.
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", [
            'step' => 'arrived', 'latitude' => 33.5973, 'longitude' => 73.0479,
        ])->assertOk();
        $this->step($booking, 'inspecting')->assertOk();
        $this->step($booking, 'working')->assertOk();
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", [
            'step' => 'completed', 'latitude' => 33.6420, 'longitude' => 73.0479,
        ])->assertOk();

        $booking->refresh();
        $this->assertSame(0, $booking->arrived_distance_m);
        $this->assertGreaterThan(4500, $booking->completed_distance_m);
    }

    public function test_cancelling_on_the_way_gives_a_strike_and_enough_strikes_stop_offers(): void
    {
        $booking = $this->bookedJob();
        $this->walkTo($booking, 'on_way');
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/cancel", ['reason' => 'Bike broke down.'])->assertOk();
        $this->assertSame(1, (int) $this->profile->fresh()->strikes_count);

        $this->profile->forceFill(['strikes_count' => 3])->save();
        $this->pro->unsetRelation('technicianProfile'); // each real request loads it fresh
        $requestId = $this->postRequest();

        $this->actingAs($this->pro)->getJson('/api/v1/pro/requests')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", [
            'labour_minor' => 200000, 'arrival_minutes' => 45,
        ])->assertUnprocessable()->assertJsonValidationErrors('quote');
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

    private function bookedJob(): Booking
    {
        $requestId = $this->postRequest();
        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", [
            'labour_minor' => 200000,
            'arrival_minutes' => 45,
        ])->assertCreated()->json('data.id');

        $bookingId = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")
            ->assertOk()->json('data.booking.id');

        return Booking::where('uuid', $bookingId)->firstOrFail();
    }

    private function step(Booking $booking, string $step): TestResponse
    {
        return $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", ['step' => $step]);
    }

    private function complete(Booking $booking, ?string $code = null): TestResponse
    {
        return $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", array_filter([
            'step' => 'completed',
            'code' => $code,
        ]));
    }

    private function dispute(Booking $booking, string $kind): TestResponse
    {
        return $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/dispute", [
            'kind' => $kind,
            'description' => 'Something went wrong with this job and I need help.',
        ]);
    }

    private function walkTo(Booking $booking, string $last): void
    {
        foreach (['on_way', 'arrived', 'inspecting', 'working'] as $step) {
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
