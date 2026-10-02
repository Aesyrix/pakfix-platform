<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\VerificationStatus;
use App\Models\BlogPost;
use App\Models\TechnicianProfile;
use App\Support\ContentCache;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/**
 * Laravel serving the built website.
 *
 * These tests write their own small HTML files and point the application at a
 * throwaway public folder, so they pass on a clean checkout, never depend on
 * whatever the last `pakfix:build` produced, and -- just as important --
 * cannot damage a real build by overwriting or deleting its files.
 */
class FrontendServingTest extends TestCase
{
    use RefreshDatabase;

    private string $publicPath = '';

    protected function setUp(): void
    {
        parent::setUp();

        $this->publicPath = storage_path('framework/testing/public-' . uniqid());
        File::ensureDirectoryExists($this->publicPath);
        $this->app->usePublicPath($this->publicPath);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->publicPath);

        parent::tearDown();
    }

    public function test_the_homepage_is_served_from_the_built_file(): void
    {
        $this->buildFile('index.html', '<html><body>Built homepage</body></html>');

        $this->get('/')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertSee('Built homepage', false);

        $headers = $this->get('/')->headers;

        $this->assertStringStartsWith('text/html', (string) $headers->get('Content-Type'));
        // HTML must revalidate, or a deploy would not reach returning visitors.
        $this->assertStringContainsString('no-cache', (string) $headers->get('Cache-Control'));
    }

    public function test_a_clean_url_maps_onto_its_built_page(): void
    {
        $this->buildFile('index.html', 'home');
        $this->buildFile('how-it-works.html', 'How it works page');

        $this->get('/how-it-works')->assertOk()->assertSee('How it works page', false);
    }

    public function test_a_directory_does_not_shadow_its_page(): void
    {
        // The build creates both services.html and a services/ folder for the
        // pages beneath it. The page must win.
        $this->buildFile('index.html', 'home');
        $this->buildFile('services.html', 'All services');
        $this->buildFile('services/plumbing.html', 'Plumbing');
        $this->buildFile('dashboard.html', 'Dashboard');
        $this->buildFile('dashboard/profile.html', 'Profile');

        $this->get('/services')->assertOk()->assertSee('All services', false);
        $this->get('/dashboard')->assertOk()->assertSee('Dashboard', false);
        $this->get('/dashboard/profile')->assertOk()->assertSee('Profile', false);
    }

    public function test_an_unknown_page_returns_the_404_page_with_a_404_status(): void
    {
        $this->buildFile('index.html', 'home');
        $this->buildFile('404.html', 'Could not find that page');

        $this->get('/no-such-page')->assertNotFound()->assertSee('Could not find that page', false);
    }

    public function test_an_unknown_api_path_still_returns_json(): void
    {
        $this->buildFile('index.html', 'home');
        $this->buildFile('404.html', 'html 404');

        $this->getJson('/api/v1/nope')
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'That API endpoint does not exist.');
    }

    public function test_it_refuses_to_serve_anything_outside_public(): void
    {
        $this->buildFile('index.html', 'home');

        foreach (['/../.env', '/..%2f.env', '/%2e%2e/.env'] as $attempt) {
            $response = $this->get($attempt);

            $this->assertContains($response->getStatusCode(), [400, 404], "{$attempt} must not be served.");
            $this->assertStringNotContainsString('APP_KEY', (string) $response->getContent());
        }
    }

    public function test_a_page_without_a_build_explains_how_to_build_it(): void
    {
        // No index.html written: this is a fresh checkout.
        $this->get('/')
            ->assertStatus(503)
            ->assertSee('php artisan pakfix:build', false);
    }

    public function test_an_article_published_after_the_build_is_served_through_the_shell(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->buildFile('index.html', 'home');
        $this->buildFile('blog/_.html', $this->shellHtml());

        $post = BlogPost::create([
            'title' => 'Written after the build',
            'slug' => 'written-after-the-build',
            'body' => 'A guide published after the site was last built.',
            'seo_description' => 'Proof that new guides do not need a rebuild.',
            'status' => BlogPost::STATUS_PUBLISHED,
            'published_at' => now()->subMinute(),
        ]);

        $response = $this->get("/blog/{$post->slug}")->assertOk();
        $html = $response->getContent();

        $this->assertStringContainsString('<title>Written after the build | PakFix</title>', (string) $html);
        $this->assertStringContainsString('Proof that new guides do not need a rebuild.', (string) $html);
        $this->assertStringContainsString('/blog/written-after-the-build', (string) $html);
        // The shell's placeholder noindex is removed once the real metadata is in.
        $this->assertStringNotContainsString('noindex', (string) $html);
    }

    public function test_the_shell_is_not_served_for_an_article_that_does_not_exist(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->buildFile('index.html', 'home');
        $this->buildFile('404.html', 'not found page');
        $this->buildFile('blog/_.html', $this->shellHtml());

        $this->get('/blog/never-written')->assertNotFound()->assertSee('not found page', false);
    }

    public function test_a_built_page_stops_being_served_when_its_record_is_withdrawn(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->buildFile('index.html', 'home');
        $this->buildFile('404.html', 'not found page');
        $this->buildFile('professionals/ahmed-raza-lahore.html', 'Ahmed profile');

        $this->get('/professionals/ahmed-raza-lahore')->assertOk()->assertSee('Ahmed profile', false);

        TechnicianProfile::where('slug', 'ahmed-raza-lahore')
            ->update(['verification_status' => VerificationStatus::Suspended->value]);
        ContentCache::flush();

        // The file is still on disk; the page must not be, because the
        // professional is no longer listed.
        $this->get('/professionals/ahmed-raza-lahore')->assertNotFound();
    }

    public function test_a_local_page_is_served_only_while_someone_covers_that_service(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->buildFile('index.html', 'home');
        $this->buildFile('404.html', 'not found page');
        $this->buildFile('_/_.html', $this->shellHtml());

        $this->get('/plumber/lahore')->assertOk();
        $this->get('/plumber/quetta')->assertNotFound();

        TechnicianProfile::where('slug', 'imran-khalid-lahore')->update(['is_accepting_jobs' => false]);
        ContentCache::flush();

        $this->get('/plumber/lahore')->assertNotFound();
    }

    public function test_built_pages_still_load_when_the_database_is_unreachable(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->buildFile('index.html', 'home');
        $this->buildFile('professionals/ahmed-raza-lahore.html', 'Ahmed profile');

        // Point the connection at a database that does not exist.
        config(['database.connections.sqlite.database' => storage_path('framework/missing-database.sqlite')]);
        \Illuminate\Support\Facades\DB::purge();

        try {
            $this->get('/professionals/ahmed-raza-lahore')->assertOk()->assertSee('Ahmed profile', false);
        } finally {
            // Put the connection back so the test transaction can roll back.
            config(['database.connections.sqlite.database' => ':memory:']);
            \Illuminate\Support\Facades\DB::purge();
        }
    }

    // -----------------------------------------------------------------

    private function buildFile(string $relative, string $contents): void
    {
        $path = public_path($relative);

        File::ensureDirectoryExists(dirname($path));
        File::put($path, $contents);
    }

    /** A stand-in for the placeholder page the build produces. */
    private function shellHtml(): string
    {
        return implode('', [
            '<html><head>',
            '<title>PakFix</title>',
            '<meta name="description" content="PakFix"/>',
            '<meta property="og:title" content="PakFix"/>',
            '<meta property="og:description" content="PakFix"/>',
            '<link rel="canonical" href="https://pakfix.pk/"/>',
            '<meta name="robots" content="noindex, follow"/>',
            '</head><body>shell</body></html>',
        ]);
    }
}
