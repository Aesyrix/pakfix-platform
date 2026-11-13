<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * What the public site says must match what PakFix does: Islamabad and
 * Rawalpindi only, cash only, no photo diagnosis, no refunds through PakFix,
 * no company or property-manager products, and no made-up testimonials.
 */
class PublicContentTruthTest extends TestCase
{
    use RefreshDatabase;

    private const NOT_TRUE = ['Lahore', 'Karachi', 'JazzCash', 'Easypaisa', 'bank transfer', 'send a photo', 'refund', 'rented'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_the_faq_and_about_page_only_describe_what_pakfix_offers(): void
    {
        $faqs = json_encode($this->getJson('/api/v1/content/faqs')->assertOk()->json('data'));
        $about = (string) $this->getJson('/api/v1/content/pages/about')->assertOk()->json('data.body');

        foreach (self::NOT_TRUE as $claim) {
            $this->assertStringNotContainsStringIgnoringCase($claim, $faqs, "FAQ mentions \"$claim\"");
            $this->assertStringNotContainsStringIgnoringCase($claim, $about, "About page mentions \"$claim\"");
        }
        $this->assertStringContainsString('Islamabad and Rawalpindi', $faqs);
        $this->assertStringContainsString('In cash', $faqs);
    }

    public function test_no_sample_testimonials_are_published(): void
    {
        $this->getJson('/api/v1/content/testimonials')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_pages_for_services_pakfix_does_not_offer_redirect(): void
    {
        $this->get('/for-service-companies')->assertStatus(301)->assertRedirect('/become-a-technician');
        $this->get('/for-property-managers')->assertStatus(301)->assertRedirect('/how-it-works');
        $this->get('/home-maintenance')->assertStatus(301)->assertRedirect('/services');
    }

    public function test_the_old_placeholder_legal_pages_are_gone(): void
    {
        foreach (['terms-of-service', 'privacy-policy', 'refund-policy', 'safety'] as $slug) {
            $this->getJson("/api/v1/content/pages/{$slug}")->assertNotFound();
            $this->get("/pages/{$slug}")->assertStatus(301)->assertRedirect("/{$slug}");
        }
    }
}
