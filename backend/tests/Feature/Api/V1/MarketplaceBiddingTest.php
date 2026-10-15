<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Booking;
use App\Models\City;
use App\Models\Quote;
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
 * Requests and bids, end to end: a customer posts a job, verified
 * professionals in reach bid on it, the customer accepts one and a booking is
 * created. The tests care as much about who is kept out as who gets in.
 */
class MarketplaceBiddingTest extends TestCase
{
    use RefreshDatabase;

    /** Saddar, Rawalpindi — about 4 km from the city centre. */
    private const JOB_LAT = 33.5973;
    private const JOB_LNG = 73.0479;

    private User $customer;
    private City $rawalpindi;
    private ServiceCategory $plumbing;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([LocationSeeder::class, ServiceCategorySeeder::class, RolePermissionSeeder::class, SettingsSeeder::class]);

        $this->rawalpindi = City::where('slug', 'rawalpindi')->firstOrFail();
        $this->plumbing = ServiceCategory::where('slug', 'plumbing')->firstOrFail();
        $this->customer = $this->user(UserRole::Customer, 'Ayesha Siddiqui');
    }

    // -----------------------------------------------------------------
    // Posting a request
    // -----------------------------------------------------------------

    public function test_a_customer_can_post_a_request_with_their_own_price(): void
    {
        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/requests', $this->requestPayload(['customer_offer_minor' => 250000]))
            ->assertCreated()
            ->assertJsonPath('data.state', QuoteRequest::STATE_ACCEPTING_BIDS)
            ->assertJsonPath('data.accepting_bids', true)
            ->assertJsonPath('data.category.slug', 'plumbing')
            ->assertJsonPath('data.customer_offer.display', 'Rs 2,500')
            ->assertJsonPath('data.address_line', 'House 12, Street 4, Saddar');

        $this->assertStringStartsWith('PFR-', $response->json('data.reference'));

        $request = QuoteRequest::firstOrFail();
        $this->assertEqualsWithDelta(120, now()->diffInMinutes($request->expires_at), 1);
    }

    public function test_an_emergency_request_closes_bidding_after_fifteen_minutes(): void
    {
        $this->actingAs($this->customer)
            ->postJson('/api/v1/requests', $this->requestPayload(['urgency' => 'emergency']))
            ->assertCreated();

        $this->assertEqualsWithDelta(15, now()->diffInMinutes(QuoteRequest::firstOrFail()->expires_at), 1);
    }

    public function test_a_request_needs_a_location_in_pakistan(): void
    {
        $payload = $this->requestPayload(['latitude' => 0, 'longitude' => 0]);

        $this->actingAs($this->customer)
            ->postJson('/api/v1/requests', $payload)
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.latitude.0', 'The job location must be in Pakistan.');
    }

    public function test_a_professional_cannot_post_a_request(): void
    {
        [$proUser] = $this->professional();

        $this->actingAs($proUser)->postJson('/api/v1/requests', $this->requestPayload())->assertForbidden();
    }

    // -----------------------------------------------------------------
    // Who sees a request
    // -----------------------------------------------------------------

    public function test_nearby_verified_professionals_in_the_trade_see_the_request(): void
    {
        $request = $this->postRequest();
        [$near] = $this->professional();                                   // Rawalpindi plumber
        [$islamabad] = $this->professional(lat: 33.6844, lng: 73.0479);     // ~10 km away
        [$lahore] = $this->professional(lat: 31.5204, lng: 74.3587);        // ~270 km away
        [$electrician] = $this->professional(category: 'electrical');

        foreach ([$near, $islamabad] as $pro) {
            $this->actingAs($pro)->getJson('/api/v1/pro/requests')
                ->assertOk()
                ->assertJsonPath('data.0.id', $request->uuid)
                ->assertJsonPath('meta.radius_km', 20);
        }

        foreach ([$lahore, $electrician] as $pro) {
            $this->actingAs($pro)->getJson('/api/v1/pro/requests')->assertOk()->assertJsonCount(0, 'data');
        }
    }

    public function test_a_professional_in_the_parent_trade_sees_a_subcategory_request(): void
    {
        $gasRefill = ServiceCategory::where('slug', 'ac-gas-refilling')->firstOrFail();
        $request = $this->postRequest(['service_category_id' => $gasRefill->uuid]);
        [$acPro] = $this->professional(category: 'ac-hvac');

        $this->actingAs($acPro)->getJson('/api/v1/pro/requests')->assertJsonPath('data.0.id', $request->uuid);
    }

    public function test_a_professional_never_sees_the_exact_address_or_who_posted(): void
    {
        $this->postRequest();
        [$pro] = $this->professional();

        $item = $this->actingAs($pro)->getJson('/api/v1/pro/requests')->json('data.0');

        $this->assertArrayNotHasKey('address_line', $item);
        $this->assertArrayNotHasKey('latitude', $item);
        $this->assertArrayNotHasKey('longitude', $item);
        $this->assertArrayNotHasKey('quotes', $item);
        $this->assertSame('Rawalpindi', $item['city']['name']);
        $this->assertLessThan(20, $item['distance_km']);
    }

    public function test_an_unverified_professional_sees_no_jobs_and_cannot_bid(): void
    {
        $request = $this->postRequest();
        [$pending] = $this->professional(verified: false);

        $this->actingAs($pending)->getJson('/api/v1/pro/requests')
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->actingAs($pending)
            ->postJson("/api/v1/pro/requests/{$request->uuid}/quotes", ['labour_minor' => 200000])
            ->assertForbidden();
    }

    public function test_a_customer_cannot_use_the_professional_endpoints(): void
    {
        $this->actingAs($this->customer)->getJson('/api/v1/pro/requests')->assertForbidden();
    }

    // -----------------------------------------------------------------
    // Bidding
    // -----------------------------------------------------------------

    public function test_a_professional_bids_and_the_server_computes_the_total(): void
    {
        $request = $this->postRequest();
        [$pro] = $this->professional();

        $this->actingAs($pro)
            ->postJson("/api/v1/pro/requests/{$request->uuid}/quotes", [
                'visit_fee_minor' => 50000,
                'labour_minor' => 200000,
                'materials_minor' => 150000,
                'total_minor' => 1,           // ignored: totals are never taken from the client
                'arrival_minutes' => 45,
                'notes' => 'I can replace the trap today.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.total.minor', 400000)
            ->assertJsonPath('data.total.display', 'Rs 4,000')
            ->assertJsonPath('data.arrival_minutes', 45)
            ->assertJsonPath('data.status', 'sent');

        $this->assertSame(1, $request->refresh()->quotes_count);
        $this->assertSame(3, Quote::firstOrFail()->items()->count());
    }

    public function test_a_professional_can_take_the_customers_price(): void
    {
        $request = $this->postRequest(['customer_offer_minor' => 300000]);
        [$pro] = $this->professional();

        $this->actingAs($pro)
            ->postJson("/api/v1/pro/requests/{$request->uuid}/quotes", ['accept_offer' => true, 'arrival_minutes' => 30])
            ->assertCreated()
            ->assertJsonPath('data.total.minor', 300000)
            ->assertJsonPath('data.labour.minor', 300000);
    }

    public function test_a_professional_cannot_bid_twice_or_with_no_price(): void
    {
        $request = $this->postRequest();
        [$pro] = $this->professional();

        $this->actingAs($pro)->postJson("/api/v1/pro/requests/{$request->uuid}/quotes", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('labour_minor');

        $this->bid($pro, $request, 200000);

        $this->actingAs($pro)->postJson("/api/v1/pro/requests/{$request->uuid}/quotes", ['labour_minor' => 150000])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('quote');
    }

    public function test_a_professional_out_of_reach_cannot_bid_even_with_the_id(): void
    {
        $request = $this->postRequest();
        [$lahore] = $this->professional(lat: 31.5204, lng: 74.3587);

        $this->actingAs($lahore)
            ->postJson("/api/v1/pro/requests/{$request->uuid}/quotes", ['labour_minor' => 150000])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('quote');
    }

    public function test_no_new_bids_after_the_window_closes(): void
    {
        $request = $this->postRequest();
        [$pro] = $this->professional();
        $this->travel(121)->minutes();

        $this->actingAs($pro)->getJson('/api/v1/pro/requests')->assertJsonCount(0, 'data');
        $this->actingAs($pro)
            ->postJson("/api/v1/pro/requests/{$request->uuid}/quotes", ['labour_minor' => 150000])
            ->assertUnprocessable();
    }

    public function test_a_professional_can_withdraw_and_list_their_offers(): void
    {
        $request = $this->postRequest();
        [$pro] = $this->professional();
        $quote = $this->bid($pro, $request, 200000);

        $this->actingAs($pro)->getJson('/api/v1/pro/quotes')
            ->assertOk()
            ->assertJsonPath('data.0.id', $quote->uuid)
            ->assertJsonPath('data.0.request.id', $request->uuid);

        $this->actingAs($pro)->postJson("/api/v1/pro/quotes/{$quote->uuid}/withdraw")
            ->assertOk()
            ->assertJsonPath('data.status', 'withdrawn');

        $this->assertSame(0, $request->refresh()->quotes_count);
    }

    // -----------------------------------------------------------------
    // Choosing an offer
    // -----------------------------------------------------------------

    public function test_the_customer_sees_every_offer_cheapest_first(): void
    {
        $request = $this->postRequest();
        [$a] = $this->professional();
        [$b] = $this->professional();
        $this->bid($a, $request, 300000);
        $this->bid($b, $request, 200000);

        $this->actingAs($this->customer)->getJson("/api/v1/requests/{$request->uuid}")
            ->assertOk()
            ->assertJsonCount(2, 'data.quotes')
            ->assertJsonPath('data.quotes.0.total.minor', 200000)
            ->assertJsonPath('data.quotes.0.professional.is_verified', true)
            ->assertJsonPath('data.quotes.0.is_actionable', true);
    }

    public function test_accepting_an_offer_books_the_professional_and_declines_the_rest(): void
    {
        $request = $this->postRequest();
        [$a] = $this->professional();
        [$b] = $this->professional();
        $chosen = $this->bid($a, $request, 250000);
        $other = $this->bid($b, $request, 300000);

        $response = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$chosen->uuid}/accept")
            ->assertOk()
            ->assertJsonPath('data.booking.status', BookingStatus::Accepted->value)
            ->assertJsonPath('data.booking.total.minor', 250000);

        $booking = Booking::where('uuid', $response->json('data.booking.id'))->firstOrFail();
        $this->assertSame($chosen->technician_profile_id, $booking->technician_profile_id);
        $this->assertSame('House 12, Street 4, Saddar', $booking->address_line);
        $this->assertSame(0, (int) $booking->commission_minor, 'Commission is off during the launch period.');
        $this->assertSame(250000, (int) $booking->technician_payout_minor);
        $this->assertSame(1, $booking->statusHistory()->count());

        $this->assertSame('accepted', $chosen->refresh()->status->value);
        $this->assertSame('rejected', $other->refresh()->status->value);
        $this->assertSame(QuoteRequest::STATE_BOOKED, $request->refresh()->state());

        // A second tap cannot book anyone else.
        $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$other->uuid}/accept")->assertUnprocessable();
        $this->assertSame(1, Booking::count());
    }

    public function test_the_customer_can_still_choose_during_the_grace_period_but_not_after(): void
    {
        $request = $this->postRequest();
        [$pro] = $this->professional();
        $quote = $this->bid($pro, $request, 200000);

        $this->travel(3)->hours();
        $this->actingAs($this->customer)->getJson("/api/v1/requests/{$request->uuid}")
            ->assertJsonPath('data.state', QuoteRequest::STATE_CHOOSING);

        $this->travel(2)->days();
        $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quote->uuid}/accept")->assertUnprocessable();
        $this->actingAs($this->customer)->getJson("/api/v1/requests/{$request->uuid}")
            ->assertJsonPath('data.state', QuoteRequest::STATE_EXPIRED);
    }

    public function test_the_customer_can_decline_an_offer(): void
    {
        $request = $this->postRequest();
        [$pro] = $this->professional();
        $quote = $this->bid($pro, $request, 200000);

        $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quote->uuid}/reject", ['reason' => 'Too expensive'])
            ->assertOk();

        $this->assertSame('rejected', $quote->refresh()->status->value);
    }

    public function test_cancelling_a_request_declines_its_waiting_offers(): void
    {
        $request = $this->postRequest();
        [$pro] = $this->professional();
        $quote = $this->bid($pro, $request, 200000);

        $this->actingAs($this->customer)->postJson("/api/v1/requests/{$request->uuid}/cancel")
            ->assertOk()
            ->assertJsonPath('data.state', QuoteRequest::STATE_CANCELLED);

        $this->assertSame('rejected', $quote->refresh()->status->value);
        $this->actingAs($pro)->getJson('/api/v1/pro/requests')->assertJsonCount(0, 'data');
    }

    public function test_another_customer_cannot_see_or_accept_the_offers(): void
    {
        $request = $this->postRequest();
        [$pro] = $this->professional();
        $quote = $this->bid($pro, $request, 200000);
        $stranger = $this->user(UserRole::Customer, 'Someone Else');

        $this->actingAs($stranger)->getJson("/api/v1/requests/{$request->uuid}")->assertNotFound();
        $this->actingAs($stranger)->postJson("/api/v1/quotes/{$quote->uuid}/accept")->assertNotFound();
        $this->actingAs($stranger)->postJson("/api/v1/requests/{$request->uuid}/cancel")->assertNotFound();
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

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
    private function professional(
        float $lat = 33.5651,
        float $lng = 73.0169,
        string $category = 'plumbing',
        bool $verified = true,
    ): array {
        $user = $this->user(UserRole::Technician, 'Pro ' . Str::random(5));

        $profile = new TechnicianProfile();
        $profile->forceFill([
            'user_id' => $user->id,
            'slug' => 'pro-' . Str::lower(Str::random(8)),
            'city_id' => $this->rawalpindi->id,
            'latitude' => $lat,
            'longitude' => $lng,
            'service_radius_km' => 20,
            'verification_status' => $verified ? VerificationStatus::Verified : VerificationStatus::Pending,
            'is_available' => true,
            'is_accepting_jobs' => true,
        ])->save();

        TechnicianService::create([
            'technician_profile_id' => $profile->id,
            'service_category_id' => ServiceCategory::where('slug', $category)->firstOrFail()->id,
            'is_active' => true,
        ]);

        return [$user, $profile];
    }

    /** @param array<string, mixed> $overrides */
    private function requestPayload(array $overrides = []): array
    {
        return array_merge([
            'service_category_id' => $this->plumbing->uuid,
            'description' => 'Water is leaking under the kitchen sink and the cabinet floor is wet.',
            'city_id' => $this->rawalpindi->id,
            'address_line' => 'House 12, Street 4, Saddar',
            'latitude' => self::JOB_LAT,
            'longitude' => self::JOB_LNG,
            'urgency' => 'standard',
        ], $overrides);
    }

    /** @param array<string, mixed> $overrides */
    private function postRequest(array $overrides = []): QuoteRequest
    {
        $id = $this->actingAs($this->customer)
            ->postJson('/api/v1/requests', $this->requestPayload($overrides))
            ->assertCreated()
            ->json('data.id');

        return QuoteRequest::where('uuid', $id)->firstOrFail();
    }

    private function bid(User $pro, QuoteRequest $request, int $labourMinor): Quote
    {
        $id = $this->actingAs($pro)
            ->postJson("/api/v1/pro/requests/{$request->uuid}/quotes", ['labour_minor' => $labourMinor, 'arrival_minutes' => 60])
            ->assertCreated()
            ->json('data.id');

        return Quote::where('uuid', $id)->firstOrFail();
    }
}
