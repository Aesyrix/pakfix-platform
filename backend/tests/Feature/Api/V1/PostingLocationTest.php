<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\City;
use App\Models\QuoteRequest;
use App\Models\ServiceCategory;
use App\Models\User;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * The map pin decides where a job is: its city and, when nothing is typed,
 * its address. Addresses come from OpenStreetMap (faked here).
 */
class PostingLocationTest extends TestCase
{
    use RefreshDatabase;

    private const G9 = [33.6875, 73.0300]; // G-9, Islamabad

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([LocationSeeder::class, ServiceCategorySeeder::class, RolePermissionSeeder::class, SettingsSeeder::class]);
        config(['pakfix.geocoding.enabled' => true]);

        $this->customer = User::factory()->create();
        $this->customer->forceFill(['phone' => '+923001112233', 'status' => 'active'])->save();
        $this->customer->assignRole(UserRole::Customer->value);
    }

    public function test_the_pin_sets_the_city_and_fills_the_address(): void
    {
        Http::fake(['nominatim.openstreetmap.org/*' => Http::response([
            'address' => ['house_number' => '12', 'road' => 'Street 41', 'neighbourhood' => 'G-9/2', 'city' => 'Islamabad'],
        ])]);
        $rawalpindi = City::where('slug', 'rawalpindi')->firstOrFail();

        $request = $this->postJob([
            'city_id' => $rawalpindi->id,   // the app's guess is replaced by the pin's city
            'address_line' => '',
        ]);

        $this->assertSame('Islamabad', $request->city->name);
        $this->assertSame('12 Street 41, G-9/2', $request->address_line);
        Http::assertSent(fn (HttpRequest $r) => str_contains($r->header('User-Agent')[0] ?? '', 'PakFix')
            && ! str_contains($r->url(), 'example.com'));
    }

    public function test_typed_details_win_and_no_city_is_needed(): void
    {
        Http::fake();

        $request = $this->postJob(['address_line' => 'House 7, near the green mosque']);

        $this->assertSame('House 7, near the green mosque', $request->address_line);
        $this->assertSame('Islamabad', $request->city->name);
        Http::assertNothingSent();
    }

    public function test_when_the_lookup_fails_the_address_is_near_the_city(): void
    {
        Http::fake(['nominatim.openstreetmap.org/*' => Http::response('', 500)]);

        $this->assertSame('Pinned on the map', $this->postJob(['address_line' => null])->address_line);
    }

    public function test_a_pin_far_from_any_pakfix_city_is_refused(): void
    {
        Http::fake();

        $this->actingAs($this->customer)
            ->postJson('/api/v1/requests', $this->payload(['latitude' => 25.1264, 'longitude' => 62.3225])) // Gwadar
            ->assertUnprocessable()
            ->assertJsonValidationErrors('city_id');
    }

    public function test_the_reverse_lookup_describes_a_pin_for_signed_in_users(): void
    {
        Http::fake(['nominatim.openstreetmap.org/*' => Http::response([
            'address' => ['road' => 'Murree Road', 'suburb' => 'Saddar'],
        ])]);
        [$lat, $lng] = [33.5973, 73.0479];

        $this->getJson("/api/v1/locations/reverse?latitude={$lat}&longitude={$lng}")->assertUnauthorized();

        $this->actingAs($this->customer)
            ->getJson("/api/v1/locations/reverse?latitude={$lat}&longitude={$lng}")
            ->assertOk()
            ->assertJsonPath('data.address', 'Murree Road, Saddar')
            ->assertJsonPath('data.city.name', 'Rawalpindi')
            ->assertJsonPath('data.served', true);

        $this->actingAs($this->customer)
            ->getJson('/api/v1/locations/reverse?latitude=51.5&longitude=-0.12')
            ->assertUnprocessable();
    }

    /** @param array<string, mixed> $overrides */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->value('uuid'),
            'description' => 'The kitchen tap has been dripping for two days.',
            'latitude' => self::G9[0],
            'longitude' => self::G9[1],
        ], $overrides);
    }

    /** @param array<string, mixed> $overrides */
    private function postJob(array $overrides): QuoteRequest
    {
        $id = $this->actingAs($this->customer)
            ->postJson('/api/v1/requests', $this->payload($overrides))
            ->assertCreated()
            ->json('data.id');

        return QuoteRequest::with('city')->where('uuid', $id)->firstOrFail();
    }
}
