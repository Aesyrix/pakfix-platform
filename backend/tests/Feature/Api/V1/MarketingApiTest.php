<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\VerificationStatus;
use App\Models\BlogPost;
use App\Models\ContactMessage;
use App\Models\TechnicianProfile;
use App\Notifications\ContactMessageReceived;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * The public marketing API: service pages, the professional directory, local
 * SEO pages, the blog, search, emergency triage and the contact form.
 */
class MarketingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_a_service_page_carries_its_problems_coverage_and_professionals(): void
    {
        $data = $this->getJson('/api/v1/services/categories/plumbing')->assertOk()->json('data');

        $this->assertSame('plumber', $data['trade']['slug']);
        $this->assertContains('Leaking tap, mixer or shower head', $data['common_problems']);
        $this->assertSame([['name' => 'Lahore', 'slug' => 'lahore', 'professional_count' => 1, 'local_path' => '/plumber/lahore']], $data['cities']);
        $this->assertSame('imran-khalid-lahore', $data['professionals'][0]['slug']);
        $this->assertNotEmpty($data['faqs']);
    }

    public function test_the_directory_lists_only_verified_professionals_and_never_their_contact_details(): void
    {
        $pending = TechnicianProfile::where('slug', 'fahad-sheikh-islamabad')->firstOrFail();
        $pending->update(['verification_status' => VerificationStatus::Pending]);

        $listing = $this->getJson('/api/v1/technicians?per_page=48')->assertOk();

        $slugs = array_column($listing->json('data'), 'slug');
        $this->assertNotContains('fahad-sheikh-islamabad', $slugs);
        $this->assertContains('ahmed-raza-lahore', $slugs);

        $body = $listing->getContent();
        $this->assertStringNotContainsString('+92300111222', $body, 'Phone numbers must never appear publicly.');
        $this->assertStringNotContainsString('@example.com', $body, 'Email addresses must never appear publicly.');

        // An unverified profile 404s rather than 403s, so its existence is not confirmed.
        $this->getJson('/api/v1/technicians/fahad-sheikh-islamabad')->assertNotFound();
    }

    public function test_the_directory_filters_by_city_and_category(): void
    {
        $slugs = array_column(
            $this->getJson('/api/v1/technicians?city=karachi&category=ac-hvac')->assertOk()->json('data'),
            'slug'
        );

        $this->assertSame(['usman-tariq-karachi'], $slugs);

        // An unknown filter is an empty result, never "everyone".
        $this->getJson('/api/v1/technicians?city=atlantis')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_a_professional_profile_includes_reviews_with_only_a_first_name_and_initial(): void
    {
        $data = $this->getJson('/api/v1/technicians/ahmed-raza-lahore')->assertOk()->json('data');

        $this->assertSame('Raza Electric Works', $data['professional']['name']);
        $this->assertNotEmpty($data['professional']['working_days']);
        $this->assertSame('Ayesha S.', $data['reviews'][0]['author']);
        $this->assertCount(5, $data['rating_breakdown']);
    }

    public function test_a_local_page_exists_only_where_the_service_can_actually_be_booked(): void
    {
        $paths = array_column($this->getJson('/api/v1/local/pages')->assertOk()->json('data'), 'path');

        $this->assertContains('/plumber/lahore', $paths);
        $this->assertNotContains('/plumber/quetta', $paths);

        $page = $this->getJson('/api/v1/local/plumber/lahore')->assertOk()->json('data');
        $this->assertSame('Lahore', $page['city']['name']);
        $this->assertSame(1, $page['professional_count']);
        $this->assertContains('DHA Phase 5', array_column($page['areas'], 'name'));

        $this->getJson('/api/v1/local/plumber/quetta')->assertNotFound();
        $this->getJson('/api/v1/local/not-a-trade/lahore')->assertNotFound();
    }

    public function test_the_last_professional_leaving_removes_the_local_page(): void
    {
        TechnicianProfile::where('slug', 'imran-khalid-lahore')->update(['is_accepting_jobs' => false]);
        \App\Support\ContentCache::flush();

        $this->getJson('/api/v1/local/plumber/lahore')->assertNotFound();
    }

    public function test_a_city_page_is_served_only_for_launched_cities(): void
    {
        $data = $this->getJson('/api/v1/local/cities/lahore')->assertOk()->json('data');

        $this->assertSame('Punjab', $data['city']['province']);
        $this->assertContains('/electrician/lahore', array_column($data['categories'], 'local_path'));

        $this->getJson('/api/v1/local/cities/gwadar')->assertNotFound();
    }

    public function test_the_blog_shows_only_published_posts_whose_time_has_come(): void
    {
        BlogPost::create([
            'title' => 'A draft nobody should see',
            'slug' => 'a-draft',
            'body' => 'Draft body that is long enough.',
            'status' => BlogPost::STATUS_DRAFT,
        ]);

        BlogPost::create([
            'title' => 'Scheduled for next week',
            'slug' => 'scheduled',
            'body' => 'Scheduled body that is long enough.',
            'status' => BlogPost::STATUS_PUBLISHED,
            'published_at' => now()->addWeek(),
        ]);

        $slugs = array_column($this->getJson('/api/v1/blog/posts')->assertOk()->json('data'), 'slug');

        $this->assertContains('why-your-ac-is-running-but-not-cooling', $slugs);
        $this->assertNotContains('a-draft', $slugs);
        $this->assertNotContains('scheduled', $slugs);

        $this->getJson('/api/v1/blog/posts/a-draft')->assertNotFound();
        $this->getJson('/api/v1/blog/posts/scheduled')->assertNotFound();
    }

    public function test_article_markdown_is_rendered_with_raw_html_stripped(): void
    {
        BlogPost::create([
            'title' => 'Hostile article',
            'slug' => 'hostile',
            'body' => "## Heading\n\n<script>alert('x')</script>\n\n[bad link](javascript:alert(1))",
            'status' => BlogPost::STATUS_PUBLISHED,
            'published_at' => now()->subMinute(),
        ]);

        $html = $this->getJson('/api/v1/blog/posts/hostile')->assertOk()->json('data.post.body_html');

        $this->assertStringContainsString('<h2>Heading</h2>', $html);
        $this->assertStringNotContainsString('<script', $html);
        $this->assertStringNotContainsString('javascript:', $html);
    }

    public function test_search_finds_public_records_and_nothing_else(): void
    {
        TechnicianProfile::where('slug', 'usman-tariq-karachi')->update(['verification_status' => VerificationStatus::Suspended]);

        $results = $this->getJson('/api/v1/search?q=cooling')->assertOk()->json('data');

        $this->assertContains('why-your-ac-is-running-but-not-cooling', array_column($results['posts'], 'slug'));
        $this->assertNotContains('usman-tariq-karachi', array_column($results['professionals'], 'slug'));

        $this->getJson('/api/v1/search?q=a')->assertStatus(422);
    }

    public function test_search_treats_wildcards_as_literal_text(): void
    {
        $results = $this->getJson('/api/v1/search?q=' . urlencode('%%'))->assertOk()->json('data');

        $this->assertSame([], $results['categories']);
        $this->assertSame([], $results['posts']);
    }

    #[DataProvider('emergencyDescriptions')]
    public function test_triage_flags_emergencies_however_they_are_phrased(string $description, string $type): void
    {
        $this->postJson('/api/v1/ai/triage', ['description' => $description])
            ->assertOk()
            ->assertJsonPath('data.is_emergency', true)
            ->assertJsonPath('data.emergency.type', $type)
            ->assertJsonPath('data.safety_level', 'emergency')
            ->assertJsonPath('data.emergency.headline', 'Do not attempt this repair yourself.');
    }

    public static function emergencyDescriptions(): array
    {
        return [
            'gas, plain English' => ['I can smell gas in the kitchen', 'gas_leak'],
            'gas, Roman Urdu' => ['ghar mein gas ki boo aa rahi hai', 'gas_leak'],
            'sparking socket' => ['the socket near the bed is sparking', 'electrical_fire'],
            'exposed wiring' => ['there are wires hanging out of the ceiling', 'exposed_wiring'],
            'shock, Roman Urdu' => ['switch se current laga', 'exposed_wiring'],
            'structural' => ['the ceiling is sagging and might collapse', 'structural'],
            'flooding' => ['pipe burst and water everywhere', 'flooding'],
        ];
    }

    public function test_triage_matches_an_ordinary_problem_to_a_service_without_calling_it_an_emergency(): void
    {
        $data = $this->postJson('/api/v1/ai/triage', ['description' => 'My AC is running but not cooling'])
            ->assertOk()
            ->json('data');

        $this->assertFalse($data['is_emergency']);
        $this->assertNull($data['emergency']);
        $this->assertSame('ac-hvac', $data['matches'][0]['category']['slug']);
        $this->assertSame('triage', $data['kind']);
        $this->assertStringContainsString('not a diagnosis', $data['disclaimer']);
    }

    public function test_the_contact_form_stores_the_message_and_notifies_support(): void
    {
        Notification::fake();

        $this->postJson('/api/v1/contact', [
            'name' => 'Bilal Ahmed',
            'email' => 'bilal@example.com',
            'phone' => '0300 1234567',
            'topic' => 'booking',
            'subject' => 'Question about a booking',
            'message' => 'Can I change the time of my AC service?',
        ])->assertCreated()->assertJsonStructure(['data' => ['reference']]);

        $message = ContactMessage::firstOrFail();
        $this->assertSame('new', $message->status);

        Notification::assertSentTo(
            new AnonymousNotifiable(),
            ContactMessageReceived::class,
            fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === config('pakfix.brand.support_email')
        );
    }

    public function test_the_contact_form_turns_away_bots_that_fill_the_hidden_field(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Spam Bot',
            'email' => 'bot@example.com',
            'topic' => 'general',
            'subject' => 'Cheap followers',
            'message' => 'Buy followers now at a great price.',
            'website' => 'https://spam.example',
        ])->assertStatus(422);

        $this->assertSame(0, ContactMessage::count());
    }
}
