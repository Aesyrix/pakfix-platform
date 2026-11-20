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
 * Both sides' track records: pros see a customer's record before offering,
 * customers see a pro's record on offers and profiles, pros rate customers
 * once per confirmed job, and admins see everything including private notes.
 */
class TrackRecordTest extends TestCase
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

    public function test_pros_see_a_new_customers_record_before_offering(): void
    {
        $requestId = $this->postRequest();

        $this->actingAs($this->pro)->getJson('/api/v1/pro/requests')
            ->assertOk()
            ->assertJsonPath('data.0.customer_record.jobs_done', 0)
            ->assertJsonPath('data.0.customer_record.cancellations', 0)
            ->assertJsonPath('data.0.customer_record.rating_average', null)
            ->assertJsonPath('data.0.customer_record.flags', ['new']);

        $this->actingAs($this->pro)->getJson("/api/v1/pro/requests/{$requestId}")
            ->assertOk()
            ->assertJsonPath('data.customer_record.flags', ['new']);

        // The customer never sees their own record on their request.
        $this->assertArrayNotHasKey('customer_record', $this->actingAs($this->customer)->getJson("/api/v1/requests/{$requestId}")->json('data'));
    }

    public function test_a_customer_who_often_cancels_is_flagged(): void
    {
        foreach ([1, 2] as $_) {
            $booking = $this->bookedJob();
            $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/cancel")->assertOk();
        }
        $this->postRequest();

        $this->actingAs($this->pro)->getJson('/api/v1/pro/requests')
            ->assertJsonPath('data.0.customer_record.cancellations', 2)
            ->assertJsonPath('data.0.customer_record.flags', ['new', 'often_cancels']);
    }

    public function test_customers_see_the_pros_record_on_offers_and_the_profile(): void
    {
        $this->profile->forceFill(['completed_jobs_count' => 12, 'cancelled_jobs_count' => 6, 'rating_average' => 4.8, 'rating_count' => 9])->save();
        $requestId = $this->postRequest();
        $this->offer($requestId);

        $this->actingAs($this->customer)->getJson("/api/v1/requests/{$requestId}")
            ->assertOk()
            ->assertJsonPath('data.quotes.0.professional.record.jobs_done', 12)
            ->assertJsonPath('data.quotes.0.professional.record.cancellations', 6)
            ->assertJsonPath('data.quotes.0.professional.record.flags', ['often_cancels', 'top_rated']);

        $this->getJson("/api/v1/technicians/{$this->profile->slug}")
            ->assertOk()
            ->assertJsonPath('data.professional.record.jobs_done', 12)
            ->assertJsonPath('data.professional.record.flags', ['often_cancels', 'top_rated']);
    }

    public function test_a_pro_rates_the_customer_once_after_a_confirmed_job(): void
    {
        $booking = $this->bookedJob();

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/rate-customer", ['rating' => 5])
            ->assertUnprocessable()->assertJsonValidationErrors('rating');

        foreach (['on_way', 'arrived', 'inspecting', 'working'] as $step) {
            $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", ['step' => $step])->assertOk();
        }
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/status", ['step' => 'completed', 'code' => $booking->fresh()->completion_code])
            ->assertOk()
            ->assertJsonPath('data.status', 'customer_confirmed');

        $this->actingAs($this->pro)->getJson("/api/v1/pro/bookings/{$booking->uuid}")
            ->assertJsonPath('data.customer_rating', null);
        $this->assertContains('rate_customer', $this->actingAs($this->pro)->getJson("/api/v1/pro/bookings/{$booking->uuid}")->json('data.actions'));

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/rate-customer", ['rating' => 9])
            ->assertUnprocessable()->assertJsonValidationErrors('rating');
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/rate-customer", ['rating' => 2, 'note' => 'Argued about the price at the end.'])
            ->assertOk()
            ->assertJsonPath('data.customer_rating.rating', 2);
        $this->assertNotContains('rate_customer', $this->actingAs($this->pro)->getJson("/api/v1/pro/bookings/{$booking->uuid}")->json('data.actions'));
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/rate-customer", ['rating' => 5])
            ->assertUnprocessable();

        // Another pro sees the rating, never the note.
        [$other] = $this->professional();
        $this->postRequest();
        $record = $this->actingAs($other)->getJson('/api/v1/pro/requests')->json('data.0.customer_record');
        $this->assertSame(2, (int) $record['rating_average']);
        $this->assertSame(1, $record['rating_count']);
        $this->assertSame(1, $record['jobs_done']);
        $this->assertStringNotContainsString('Argued', json_encode($this->actingAs($other)->getJson('/api/v1/pro/requests')->json()));
        $this->assertStringNotContainsString('Argued', json_encode($this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")->json()));

        // PakFix staff see it all.
        $this->actingAs($this->staff())->getJson("/api/v1/admin/users/{$this->customer->uuid}")
            ->assertOk()
            ->assertJsonPath('data.track_record.as_customer.rating_count', 1)
            ->assertJsonPath('data.track_record.pro_notes.0.note', 'Argued about the price at the end.');
    }

    public function test_someone_elses_job_cannot_be_rated(): void
    {
        $booking = $this->bookedJob();
        [$other] = $this->professional();

        $this->actingAs($other)->postJson("/api/v1/pro/bookings/{$booking->uuid}/rate-customer", ['rating' => 1])->assertNotFound();
        $this->actingAs($this->customer)->postJson("/api/v1/pro/bookings/{$booking->uuid}/rate-customer", ['rating' => 1])->assertForbidden();
    }

    // -----------------------------------------------------------------

    private function postRequest(): string
    {
        return $this->actingAs($this->customer)->postJson('/api/v1/requests', [
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->uuid,
            'description' => 'Water is leaking under the kitchen sink and the cabinet floor is wet.',
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

    private function staff(): User
    {
        return $this->user(UserRole::Admin, 'Admin '.Str::random(4));
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
