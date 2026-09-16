<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Models\Setting;
use Database\Seeders\CmsSeeder;
use Database\Seeders\LocationSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The endpoints the marketing site renders from. These are public by design,
 * so the tests care as much about what is *not* in the payload as what is.
 */
class PublicCatalogueTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            LocationSeeder::class,
            ServiceCategorySeeder::class,
            SettingsSeeder::class,
            CmsSeeder::class,
        ]);
    }

    public function test_the_category_tree_is_public_and_nests_subcategories(): void
    {
        $response = $this->getJson('/api/v1/services/categories')
            ->assertOk()
            ->assertJsonPath('success', true);

        $categories = $response->json('data');

        $this->assertNotEmpty($categories);

        $ac = collect($categories)->firstWhere('slug', 'ac-hvac');
        $this->assertNotNull($ac, 'AC / HVAC should be a top-level category.');
        $this->assertNotEmpty($ac['children'], 'AC / HVAC should carry its subcategories.');
        $this->assertContains('AC Gas Refilling', array_column($ac['children'], 'name'));

        // Money is sent as minor units plus a preformatted string.
        $this->assertSame(200000, $ac['typical_price']['min_minor']);
        $this->assertSame('Rs 2,000 - Rs 25,000', $ac['typical_price']['display']);
    }

    public function test_a_category_can_be_fetched_with_its_services(): void
    {
        $this->getJson('/api/v1/services/categories/plumbing')
            ->assertOk()
            ->assertJsonPath('data.category.slug', 'plumbing')
            ->assertJsonPath('data.category.name', 'Plumbing')
            ->assertJsonPath('data.category.is_emergency', true);

        $services = $this->getJson('/api/v1/services/categories/plumbing')
            ->json('data.category.services');

        $this->assertNotEmpty($services);
        $this->assertContains('Leaking tap repair', array_column($services, 'name'));
    }

    public function test_an_unknown_category_returns_the_standard_error_envelope(): void
    {
        $this->getJson('/api/v1/services/categories/does-not-exist')
            ->assertNotFound()
            ->assertExactJson([
                'success' => false,
                'message' => 'That service does not exist.',
            ]);
    }

    public function test_quote_only_services_do_not_advertise_a_price(): void
    {
        $services = $this->getJson('/api/v1/services?category=pest-control')
            ->assertOk()
            ->json('data');

        $termite = collect($services)->firstWhere('name', 'Termite treatment');

        $this->assertNotNull($termite);
        $this->assertNull($termite['base_price_minor']);
        $this->assertSame('Quoted after inspection', $termite['price_display']);
    }

    public function test_cities_can_be_filtered_to_the_ones_pakfix_serves(): void
    {
        $all = $this->getJson('/api/v1/locations/cities')->assertOk()->json('data');
        $served = $this->getJson('/api/v1/locations/cities?served=1')->assertOk()->json('data');

        $this->assertGreaterThan(count($served), count($all));
        $this->assertNotEmpty($served);

        foreach ($served as $city) {
            $this->assertTrue($city['is_served'], $city['name'] . ' should be a served city.');
        }

        $this->assertContains('Lahore', array_column($served, 'name'));
        $this->assertNotContains('Gwadar', array_column($served, 'name'));
    }

    public function test_a_city_carries_its_areas(): void
    {
        $city = $this->getJson('/api/v1/locations/cities/lahore')->assertOk()->json('data');

        $this->assertSame('Lahore', $city['name']);
        $this->assertSame('Punjab', $city['province']['name']);
        $this->assertContains('DHA Phase 5', array_column($city['areas'], 'name'));
    }

    public function test_areas_can_be_searched_within_a_city(): void
    {
        $areas = $this->getJson('/api/v1/locations/cities/karachi/areas?q=clifton')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $areas);
        $this->assertSame('Clifton', $areas[0]['name']);
    }

    public function test_the_homepage_content_blocks_are_editable_data_not_hardcoded(): void
    {
        $blocks = $this->getJson('/api/v1/content/blocks?page=home')->assertOk()->json('data');

        $this->assertArrayHasKey('home.hero', $blocks);
        $this->assertSame(
            'Show Us What is Wrong. PakFix Helps You Fix It.',
            $blocks['home.hero']['title']
        );
        $this->assertContains('My AC is not cooling', $blocks['home.hero']['content']['examples']);
        $this->assertSame('/ai', $blocks['home.hero']['cta']['url']);
    }

    public function test_the_bootstrap_payload_never_leaks_a_secret(): void
    {
        // An admin saves a real credential through the settings table.
        $secret = Setting::where('key', 'ai.openai_api_key')->firstOrFail();
        $secret->setTypedValue('sk-super-secret-value');
        $secret->save();

        $response = $this->getJson('/api/v1/bootstrap')->assertOk();

        $response->assertJsonPath('data.brand.name', 'PakFix');
        $response->assertJsonPath('data.currency.code', 'PKR');
        $this->assertContains('cash', $response->json('data.payment_methods'));
        // Gateways that are switched off are simply absent.
        $this->assertNotContains('card', $response->json('data.payment_methods'));

        // The key must appear nowhere in the public payload, encrypted or not.
        $body = $response->getContent();
        $this->assertStringNotContainsString('sk-super-secret-value', $body);
        $this->assertStringNotContainsString('openai_api_key', $body);
    }

    public function test_legal_pages_are_served_from_the_cms(): void
    {
        $this->getJson('/api/v1/content/pages/privacy-policy')
            ->assertOk()
            ->assertJsonPath('data.title', 'Privacy Policy');

        $this->getJson('/api/v1/content/pages/nonexistent-page')->assertNotFound();
    }

    public function test_an_unknown_api_path_returns_json_not_html(): void
    {
        $this->getJson('/api/v1/there-is-no-such-thing')
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'That API endpoint does not exist.');
    }
}
