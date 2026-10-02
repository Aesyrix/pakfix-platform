<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Models\AuditLog;
use App\Models\BlogPost;
use App\Models\CmsPage;
use App\Models\ContactMessage;
use App\Models\ServiceCategory;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Content management: who may edit, that edits go live immediately, that
 * they are audited, and that bad input cannot break a public page.
 */
class AdminContentTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->admin = User::where('email', 'admin@pakfix.pk')->firstOrFail();
    }

    public function test_customers_and_guests_cannot_reach_the_admin_api(): void
    {
        $this->getJson('/api/v1/admin/overview')->assertUnauthorized();

        $customer = User::where('email', 'ayesha@example.com')->firstOrFail();

        $this->actingAs($customer)->getJson('/api/v1/admin/overview')->assertForbidden();
        $this->actingAs($customer)
            ->patchJson('/api/v1/admin/content-blocks/home.hero', ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_a_support_agent_can_work_the_inbox_but_not_edit_the_site(): void
    {
        $agent = User::where('email', 'support@pakfix.pk')->firstOrFail();

        $this->actingAs($agent)->getJson('/api/v1/admin/contact-messages')->assertOk();
        $this->actingAs($agent)->getJson('/api/v1/admin/overview')->assertOk()
            ->assertJsonPath('data.permissions.inbox', true)
            ->assertJsonPath('data.permissions.content', false);

        $this->actingAs($agent)
            ->patchJson('/api/v1/admin/content-blocks/home.hero', ['title' => 'Nope'])
            ->assertForbidden();
    }

    public function test_editing_the_homepage_goes_live_immediately_and_is_audited(): void
    {
        // Warm the public cache first, so the test proves it is invalidated.
        $this->getJson('/api/v1/content/blocks?page=home')->assertOk();

        $this->actingAs($this->admin)->patchJson('/api/v1/admin/content-blocks/home.hero', [
            'title' => 'Fix it the easy way',
            'content' => ['examples' => ['My geyser is not heating', '  ', 'Door will not lock']],
        ])->assertOk();

        $this->forgetAuthenticatedUser();

        $hero = $this->getJson('/api/v1/content/blocks?page=home')->json('data')['home.hero'];
        $this->assertSame('Fix it the easy way', $hero['title']);
        // Blank list items are dropped rather than rendered as empty chips.
        $this->assertSame(['My geyser is not heating', 'Door will not lock'], $hero['content']['examples']);

        $log = AuditLog::where('action', 'content_block.updated')->firstOrFail();
        $this->assertSame($this->admin->id, $log->actor_id);
        $this->assertSame('Fix it the easy way', $log->new_values['title']);
    }

    public function test_content_the_page_cannot_render_is_refused(): void
    {
        $this->actingAs($this->admin)->patchJson('/api/v1/admin/content-blocks/home.hero', [
            'content' => ['examples' => [['deeply' => ['nested' => 'thing']]]],
        ])->assertStatus(422);

        $this->actingAs($this->admin)->patchJson('/api/v1/admin/content-blocks/home.hero', [
            'cta_label' => 'Click',
            'cta_url' => 'javascript:alert(1)',
        ])->assertStatus(422)->assertJsonValidationErrors('cta_url');
    }

    public function test_faqs_can_be_created_edited_and_deleted(): void
    {
        $id = $this->actingAs($this->admin)->postJson('/api/v1/admin/faqs', [
            'question' => 'Do you work on Sundays?',
            'answer' => 'Some professionals do; their profile lists their working days.',
        ])->assertCreated()->json('data.id');

        $this->forgetAuthenticatedUser();
        $this->assertContains('Do you work on Sundays?', array_column($this->getJson('/api/v1/content/faqs')->json('data'), 'question'));

        $this->actingAs($this->admin)->patchJson("/api/v1/admin/faqs/{$id}", ['is_active' => false])->assertOk();
        $this->forgetAuthenticatedUser();
        $this->assertNotContains('Do you work on Sundays?', array_column($this->getJson('/api/v1/content/faqs')->json('data'), 'question'));

        $this->actingAs($this->admin)->deleteJson("/api/v1/admin/faqs/{$id}")->assertOk();
    }

    public function test_system_pages_can_be_edited_but_not_deleted_or_unpublished(): void
    {
        $privacy = CmsPage::where('slug', 'privacy-policy')->firstOrFail();

        $this->actingAs($this->admin)->patchJson("/api/v1/admin/pages/{$privacy->uuid}", [
            'body' => "## Your data\n\nWe store what we need to run your bookings.",
            'is_published' => false,
            'slug' => 'something-else',
        ])->assertOk()
            ->assertJsonPath('data.slug', 'privacy-policy')
            ->assertJsonPath('data.is_published', true);

        $this->actingAs($this->admin)->deleteJson("/api/v1/admin/pages/{$privacy->uuid}")->assertStatus(422);

        $this->forgetAuthenticatedUser();
        $this->assertStringContainsString(
            '<h2>Your data</h2>',
            $this->getJson('/api/v1/content/pages/privacy-policy')->json('data.body_html')
        );
    }

    public function test_an_article_can_be_drafted_then_published(): void
    {
        $uuid = $this->actingAs($this->admin)->postJson('/api/v1/admin/blog/posts', [
            'title' => 'How to read your electricity bill',
            'body' => 'Every bill in Pakistan has the same sections. Here is what each one means.',
            'status' => 'draft',
            'blog_category_slug' => 'home-maintenance',
            'tags' => ['Bills', 'Electricity'],
        ])->assertCreated()
            ->assertJsonPath('data.slug', 'how-to-read-your-electricity-bill')
            ->assertJsonPath('data.status', 'draft')
            ->json('data.id');

        $this->forgetAuthenticatedUser();
        $this->getJson('/api/v1/blog/posts/how-to-read-your-electricity-bill')->assertNotFound();

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/blog/posts/{$uuid}", ['status' => 'published'])
            ->assertOk()
            ->assertJsonPath('data.status', 'published');

        $this->forgetAuthenticatedUser();
        $this->getJson('/api/v1/blog/posts/how-to-read-your-electricity-bill')
            ->assertOk()
            ->assertJsonPath('data.post.tags.0.name', 'Bills');

        $this->assertNotNull(BlogPost::where('uuid', $uuid)->value('published_at'));
    }

    public function test_a_trade_slug_that_would_shadow_a_real_page_is_refused(): void
    {
        $category = ServiceCategory::where('slug', 'gardening')->firstOrFail();

        foreach (['blog', 'lahore', 'plumber'] as $clash) {
            $this->actingAs($this->admin)->patchJson("/api/v1/admin/service-categories/{$category->uuid}", [
                'trade_slug' => $clash,
                'trade_name' => 'Gardener',
            ])->assertStatus(422)->assertJsonValidationErrors('trade_slug');
        }

        $this->actingAs($this->admin)->patchJson("/api/v1/admin/service-categories/{$category->uuid}", [
            'trade_slug' => 'gardener',
            'trade_name' => 'Gardener',
            'typical_min_rupees' => 2000,
            'typical_max_rupees' => 9000,
        ])->assertOk()->assertJsonPath('data.typical_max_rupees', 9000);

        $this->assertSame(900000, $category->fresh()->typical_max_minor);
    }

    public function test_settings_edits_are_limited_to_marketing_groups_and_validated(): void
    {
        $this->actingAs($this->admin)->patchJson('/api/v1/admin/settings', [
            'values' => ['commission.percentage' => '50'],
        ])->assertStatus(422);

        $this->actingAs($this->admin)->patchJson('/api/v1/admin/settings', [
            'values' => ['ai.openai_api_key' => 'sk-steal'],
        ])->assertStatus(422);

        $this->actingAs($this->admin)->patchJson('/api/v1/admin/settings', [
            'values' => ['social.facebook' => 'http://insecure.example'],
        ])->assertStatus(422);

        $this->actingAs($this->admin)->patchJson('/api/v1/admin/settings', [
            'values' => [
                'platform.support_phone' => '+92 42 111 000 111',
                'social.instagram' => 'https://instagram.com/pakfix',
            ],
        ])->assertOk();

        // The refused commission edit left the money setting untouched.
        $this->assertSame('10', Setting::where('key', 'commission.percentage')->first()->typedValue());

        $this->forgetAuthenticatedUser();
        $this->getJson('/api/v1/bootstrap')
            ->assertJsonPath('data.brand.support_phone', '+92 42 111 000 111')
            ->assertJsonPath('data.social.instagram', 'https://instagram.com/pakfix');
    }

    public function test_marking_a_contact_message_handled_records_who_handled_it(): void
    {
        $message = ContactMessage::create([
            'name' => 'Sana', 'email' => 'sana@example.com', 'topic' => 'general',
            'subject' => 'Hello', 'message' => 'Just saying hello to the team.',
        ]);

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/contact-messages/{$message->uuid}", ['status' => 'handled'])
            ->assertOk()
            ->assertJsonPath('data.handled_by', 'PakFix Admin');

        $this->assertNotNull($message->fresh()->handled_at);
    }
}
