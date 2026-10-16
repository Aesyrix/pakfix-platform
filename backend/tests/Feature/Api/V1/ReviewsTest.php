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
 * Reviews: the customer of a confirmed job reviews it once, the professional
 * replies once, and the professional's rating is the average of their reviews.
 */
class ReviewsTest extends TestCase
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

    public function test_the_customer_reviews_a_confirmed_job_once(): void
    {
        $booking = $this->confirmedJob();

        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")->assertJsonPath('data.actions', ['review']);

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/review", [
            'rating' => 5,
            'comment' => 'Fixed the leak quickly and cleaned up.',
            'would_recommend' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.review.rating', 5)
            ->assertJsonPath('data.actions', []);

        $this->profile->refresh();
        $this->assertSame(1, (int) $this->profile->rating_count);
        $this->assertEqualsWithDelta(5.0, (float) $this->profile->rating_average, 0.001);

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/review", ['rating' => 1])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('review');
    }

    public function test_a_job_cannot_be_reviewed_before_it_is_confirmed(): void
    {
        $booking = $this->confirmedJob(confirm: false);

        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/review", ['rating' => 4])
            ->assertUnprocessable();
        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/review", [])
            ->assertUnprocessable()
            ->assertJsonPath('errors.rating.0', 'Choose a star rating.');
    }

    public function test_the_rating_is_the_average_of_all_reviews(): void
    {
        foreach ([5, 3] as $stars) {
            $booking = $this->confirmedJob();
            $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/review", ['rating' => $stars])->assertOk();
        }

        $this->profile->refresh();
        $this->assertSame(2, (int) $this->profile->rating_count);
        $this->assertEqualsWithDelta(4.0, (float) $this->profile->rating_average, 0.001);
    }

    public function test_the_professional_replies_once_and_it_shows_publicly(): void
    {
        $booking = $this->confirmedJob();
        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/review", ['rating' => 4, 'comment' => 'Good work.'])->assertOk();

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/review-response", ['response' => 'Thank you, happy to help.'])
            ->assertOk()
            ->assertJsonPath('data.review.response', 'Thank you, happy to help.');

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/review-response", ['response' => 'Again'])
            ->assertUnprocessable();

        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/technicians/{$this->profile->slug}")
            ->assertOk()
            ->assertJsonFragment(['response' => 'Thank you, happy to help.']);
    }

    public function test_only_the_customer_can_review_and_only_the_professional_can_reply(): void
    {
        $booking = $this->confirmedJob();
        $stranger = $this->user(UserRole::Customer, 'Someone Else');

        $this->actingAs($stranger)->postJson("/api/v1/bookings/{$booking->uuid}/review", ['rating' => 1])->assertNotFound();
        $this->actingAs($this->customer)->postJson("/api/v1/pro/bookings/{$booking->uuid}/review-response", ['response' => 'x y'])->assertForbidden();

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$booking->uuid}/review-response", ['response' => 'Too early'])
            ->assertNotFound();
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private function confirmedJob(bool $confirm = true): Booking
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

        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 200000])
            ->assertCreated()->json('data.id');
        $bookingId = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")->assertOk()->json('data.booking.id');

        foreach (['on_way', 'arrived', 'inspecting', 'working', 'completed'] as $step) {
            $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$bookingId}/status", ['step' => $step])->assertOk();
        }
        if ($confirm) {
            $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$bookingId}/confirm")->assertOk();
        }

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
        $profile = new TechnicianProfile();
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
