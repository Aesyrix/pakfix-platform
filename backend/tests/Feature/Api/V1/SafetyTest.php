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
use App\Models\UserReport;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Reporting and blocking between the customer and the professional on a job,
 * and the moderation queue that handles reports.
 */
class SafetyTest extends TestCase
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

    public function test_a_customer_reports_a_message_and_a_moderator_handles_it(): void
    {
        $booking = $this->job();
        $messageId = $this->actingAs($this->pro)->postJson("/api/v1/bookings/{$booking->uuid}/messages", ['body' => 'Pay me outside the app or else.'])
            ->assertCreated()->json('data.id');

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/report", [
            'reason' => 'harassment',
            'details' => 'He threatened me.',
            'message_id' => $messageId,
        ])->assertCreated()->assertJsonPath('data.status', 'open');

        $report = UserReport::firstOrFail();
        $this->assertSame($this->pro->id, $report->reported_user_id);
        $this->assertSame('Pay me outside the app or else.', $report->snapshot, 'the evidence is copied');

        $admin = $this->user(UserRole::Admin, 'Admin Person');
        $this->actingAs($admin)->getJson('/api/v1/admin/overview')->assertJsonPath('data.inbox.open_reports', 1);
        $this->actingAs($admin)->getJson('/api/v1/admin/reports')
            ->assertOk()
            ->assertJsonPath('data.0.reason', 'harassment')
            ->assertJsonPath('data.0.reported.id', $this->pro->uuid)
            ->assertJsonPath('data.0.booking.reference', $booking->reference);

        $this->actingAs($admin)->patchJson("/api/v1/admin/reports/{$report->uuid}", ['status' => 'actioned', 'resolution' => 'Warned the professional.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'actioned')
            ->assertJsonPath('data.handled_by', 'Admin Person');
        $this->actingAs($admin)->getJson('/api/v1/admin/reports')->assertJsonCount(0, 'data');

        // Customers cannot see the queue.
        $this->actingAs($this->customer)->getJson('/api/v1/admin/reports')->assertForbidden();
    }

    public function test_you_can_only_report_the_other_persons_messages(): void
    {
        $booking = $this->job();
        $own = $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/messages", ['body' => 'Hello'])->json('data.id');

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/report", ['reason' => 'spam', 'message_id' => $own])
            ->assertUnprocessable()->assertJsonValidationErrors('message_id');
        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/report", [])
            ->assertUnprocessable()->assertJsonPath('errors.reason.0', 'Choose a reason.');
        $this->actingAs($this->user(UserRole::Customer, 'Stranger'))
            ->postJson("/api/v1/bookings/{$booking->uuid}/report", ['reason' => 'spam'])->assertNotFound();
    }

    public function test_blocking_closes_the_chat_both_ways_until_unblocked(): void
    {
        $booking = $this->job();
        $url = "/api/v1/bookings/{$booking->uuid}/messages";

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/block")->assertOk()->assertJsonPath('data.blocked', 'by_me');

        $this->actingAs($this->customer)->getJson($url)->assertJsonPath('meta.chat.blocked', 'by_me')->assertJsonPath('meta.chat.can_send', false);
        $this->actingAs($this->pro)->getJson($url)->assertJsonPath('meta.chat.blocked', 'by_them');
        $this->actingAs($this->pro)->postJson($url, ['body' => 'hello?'])
            ->assertUnprocessable()->assertJsonPath('errors.body.0', 'You cannot message this person.');
        $this->actingAs($this->customer)->postJson($url, ['body' => 'hi'])->assertUnprocessable();

        $this->actingAs($this->customer)->getJson('/api/v1/blocks')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_id', $this->pro->uuid);

        // The blocked person cannot undo it; the blocker can.
        $this->actingAs($this->pro)->deleteJson("/api/v1/bookings/{$booking->uuid}/block")->assertOk()->assertJsonPath('data.blocked', 'by_them');
        $this->actingAs($this->customer)->deleteJson("/api/v1/blocks/{$this->pro->uuid}")->assertOk();
        $this->actingAs($this->pro)->postJson($url, ['body' => 'Thanks for unblocking'])->assertCreated();
    }

    public function test_a_blocked_professional_no_longer_sees_or_bids_on_the_customers_requests(): void
    {
        $first = $this->job();
        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$first->uuid}/block")->assertOk();

        $requestId = $this->postRequest();
        $this->actingAs($this->pro)->getJson('/api/v1/pro/requests')
            ->assertOk()
            ->assertJsonMissing(['id' => $requestId]);
        $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 100000])
            ->assertUnprocessable();

        // After unblocking, the request is visible again.
        $this->actingAs($this->customer)->deleteJson("/api/v1/bookings/{$first->uuid}/block")->assertOk();
        $this->actingAs($this->pro)->getJson('/api/v1/pro/requests')->assertJsonFragment(['id' => $requestId]);
    }

    public function test_an_offer_from_a_blocked_professional_cannot_be_accepted(): void
    {
        $first = $this->job();
        $requestId = $this->postRequest();
        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 150000])
            ->assertCreated()->json('data.id');

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$first->uuid}/block")->assertOk();
        $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")
            ->assertUnprocessable()->assertJsonPath('errors.quote.0', 'You cannot book this professional.');
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private function postRequest(): string
    {
        return $this->actingAs($this->customer)->postJson('/api/v1/requests', [
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->uuid,
            'description' => 'The bathroom tap keeps dripping all night and the washer looks worn out.',
            'city_id' => $this->rawalpindi->id,
            'address_line' => 'House 12, Street 4, Saddar',
            'latitude' => 33.5973,
            'longitude' => 73.0479,
        ])->assertCreated()->json('data.id');
    }

    private function job(): Booking
    {
        $requestId = $this->postRequest();
        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 200000])
            ->assertCreated()->json('data.id');
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
