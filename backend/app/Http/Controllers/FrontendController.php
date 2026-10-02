<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\City;
use App\Models\CmsPage;
use App\Models\ServiceCategory;
use App\Services\Marketplace\CoverageMap;
use App\Support\ApiResponse;
use App\Support\Markdown;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Throwable;

/**
 * Serves the website from PHP.
 *
 * The Next.js app is compiled to static HTML (`php artisan pakfix:build`) and
 * copied into public/. This controller maps clean URLs onto those files, so
 * one PHP server -- Apache, nginx with PHP-FPM, or `php artisan serve` --
 * runs the whole platform with no Node process in production.
 *
 * Pages that exist at build time are served as they were built. Content
 * created after the build (a new article, a newly verified professional)
 * would otherwise 404 until the next deploy, so for those routes the
 * controller checks the database and serves a pre-built "shell" page that
 * loads its content in the browser, with the title and description filled
 * in here so search engines still see the right metadata.
 */
class FrontendController extends Controller
{
    /** The placeholder segment the build uses for shell pages. */
    public const SHELL = '_';

    public function __construct(private readonly CoverageMap $coverage)
    {
    }

    public function __invoke(Request $request): SymfonyResponse
    {
        $path = trim(rawurldecode($request->path()), '/');

        if ($path === 'api' || str_starts_with($path, 'api/')) {
            return ApiResponse::notFound('That API endpoint does not exist.');
        }

        if (! $this->isBuilt()) {
            return $this->notBuilt();
        }

        // Anything odd in the path is simply not a page.
        if (! preg_match('#^[a-z0-9/_.\-]*$#i', $path) || str_contains($path, '..')) {
            return $this->notFound();
        }

        $built = $this->builtPage($path);

        /*
         * Database-backed pages are re-checked on every request, even when a
         * built file exists: a professional suspended or an article
         * unpublished after the last deploy must stop being served at once,
         * not at the next build.
         *
         * If the database is unreachable, a page that was built is still
         * served. A brief database problem should cost the dynamic pages, not
         * the whole website.
         */
        if ($this->isDynamicPath($path)) {
            try {
                $meta = $this->dynamicMeta($path);
            } catch (Throwable $exception) {
                report($exception);

                return $built ? $this->html($built) : $this->notFound();
            }

            if ($meta === null) {
                return $this->notFound();
            }

            if ($built) {
                return $this->html($built);
            }

            $shell = $this->shellFor($path);

            return $shell ? $this->html($shell, 200, $meta) : $this->notFound();
        }

        // A city page built while the city was served must not outlive it.
        if (! str_contains($path, '/')) {
            try {
                if (City::where('slug', $path)->where('is_served', false)->exists()) {
                    return $this->notFound();
                }
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $built ? $this->html($built) : $this->notFound();
    }

    // -----------------------------------------------------------------
    // Resolution
    // -----------------------------------------------------------------

    private function builtPage(string $path): ?string
    {
        // Placeholder pages are only reachable through dynamicShell(), with
        // their metadata filled in -- never at their literal URL.
        if (in_array(self::SHELL, explode('/', $path), true)) {
            return null;
        }

        $candidates = $path === '' ? ['index.html'] : ["{$path}.html", "{$path}/index.html"];

        foreach ($candidates as $candidate) {
            if ($file = $this->safePublicFile($candidate)) {
                return $file;
            }
        }

        return null;
    }

    private const SHELL_FAMILIES = ['blog', 'services', 'professionals', 'pages'];

    /** Static top-level sections with two-segment URLs that are not local pages. */
    private const STATIC_SECTIONS = ['admin', 'dashboard', 'pro'];

    /**
     * Two-segment URLs backed by a database row: /blog/x, /services/x,
     * /professionals/x, /pages/x, and local pages such as /plumber/lahore.
     */
    private function isDynamicPath(string $path): bool
    {
        $segments = explode('/', $path);

        return count($segments) === 2
            && $segments[1] !== ''
            && ! in_array($segments[0], self::STATIC_SECTIONS, true)
            && ! ($segments[0] === 'blog' && $segments[1] === 'category');
    }

    /** @return array{title: string, description: ?string}|null */
    private function dynamicMeta(string $path): ?array
    {
        [$section, $slug] = explode('/', $path);

        return match ($section) {
            'blog' => $this->blogMeta($slug),
            'services' => $this->serviceMeta($slug),
            'professionals' => $this->professionalMeta($slug),
            'pages' => $this->pageMeta($slug),
            default => $this->localMeta($section, $slug),
        };
    }

    private function shellFor(string $path): ?string
    {
        $section = explode('/', $path)[0];

        return $this->safePublicFile(
            in_array($section, self::SHELL_FAMILIES, true)
                ? "{$section}/" . self::SHELL . '.html'
                : self::SHELL . '/' . self::SHELL . '.html'
        );
    }

    private function blogMeta(string $slug): ?array
    {
        $post = BlogPost::published()->where('slug', $slug)->first(['title', 'seo_title', 'seo_description', 'excerpt', 'body']);

        return $post ? [
            'title' => ($post->seo_title ?: $post->title) . ' | PakFix',
            'description' => $post->seo_description ?: ($post->excerpt ?: Markdown::excerpt($post->body)),
        ] : null;
    }

    private function serviceMeta(string $slug): ?array
    {
        $category = ServiceCategory::active()->where('slug', $slug)->first(['name', 'seo_title', 'seo_description', 'description']);

        return $category ? [
            'title' => $category->seo_title ?: "{$category->name} Services in Pakistan | PakFix",
            'description' => $category->seo_description ?: $category->description,
        ] : null;
    }

    private function professionalMeta(string $slug): ?array
    {
        $professional = $this->coverage->professionals()->where('slug', $slug)->with(['user', 'city'])->first();

        return $professional ? [
            'title' => "{$professional->displayName()}" . ($professional->city ? " in {$professional->city->name}" : '') . ' | PakFix',
            'description' => $professional->bio,
        ] : null;
    }

    private function pageMeta(string $slug): ?array
    {
        $page = CmsPage::published()->where('slug', $slug)->first(['title', 'seo_title', 'seo_description', 'body']);

        return $page ? [
            'title' => ($page->seo_title ?: $page->title) . ' | PakFix',
            'description' => $page->seo_description ?: Markdown::excerpt($page->body),
        ] : null;
    }

    private function localMeta(string $trade, string $citySlug): ?array
    {
        $category = ServiceCategory::active()->where('trade_slug', $trade)->first();
        $city = City::served()->where('slug', $citySlug)->first();

        if (! $category || ! $city || $this->coverage->professionalCount($category, $city) === 0) {
            return null;
        }

        return [
            'title' => "{$category->trade_name} in {$city->name} | Verified Professionals | PakFix",
            'description' => "Book a verified {$category->trade_name} in {$city->name}. Compare ratings, see typical prices, and get it fixed with PakFix.",
        ];
    }

    // -----------------------------------------------------------------
    // Responses
    // -----------------------------------------------------------------

    /** A file inside public/, or null. Refuses anything that resolves outside it. */
    private function safePublicFile(string $relative): ?string
    {
        $root = realpath(public_path());
        $file = realpath(public_path($relative));

        if ($root === false || $file === false || ! is_file($file)) {
            return null;
        }

        return str_starts_with($file, $root . DIRECTORY_SEPARATOR) ? $file : null;
    }

    private function html(string $file, int $status = 200, ?array $meta = null): Response
    {
        $html = (string) file_get_contents($file);

        if ($meta !== null) {
            $html = $this->withMeta($html, $meta);
        }

        return response($html, $status)->withHeaders([
            'Content-Type' => 'text/html; charset=UTF-8',
            // HTML must be revalidated so a deploy shows up at once; the
            // hashed assets it references are cached for a year elsewhere.
            'Cache-Control' => 'no-cache, must-revalidate',
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'SAMEORIGIN',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
        ]);
    }

    /** Fills a shell page's placeholder metadata with the real title and description. */
    private function withMeta(string $html, array $meta): string
    {
        $title = e($meta['title']);
        $description = e(mb_substr(trim((string) ($meta['description'] ?? '')), 0, 300));
        $canonical = e(url()->current());

        $html = preg_replace('#<title>.*?</title>#s', "<title>{$title}</title>", $html, 1) ?? $html;
        $html = preg_replace('#<meta name="description" content="[^"]*"\s*/?>#', "<meta name=\"description\" content=\"{$description}\"/>", $html, 1) ?? $html;
        $html = preg_replace('#<meta property="og:title" content="[^"]*"\s*/?>#', "<meta property=\"og:title\" content=\"{$title}\"/>", $html, 1) ?? $html;
        $html = preg_replace('#<meta property="og:description" content="[^"]*"\s*/?>#', "<meta property=\"og:description\" content=\"{$description}\"/>", $html, 1) ?? $html;
        $html = preg_replace('#<link rel="canonical" href="[^"]*"\s*/?>#', "<link rel=\"canonical\" href=\"{$canonical}\"/>", $html, 1) ?? $html;
        // A shell is never indexable under its own placeholder metadata, so
        // strip the noindex the build gave it now that the metadata is real.
        $html = preg_replace('#<meta name="robots" content="noindex[^"]*"\s*/?>#', '', $html, 1) ?? $html;

        return $html;
    }

    private function notFound(): Response
    {
        $file = $this->safePublicFile('404.html');

        if ($file) {
            return $this->html($file, 404);
        }

        return response('Page not found.', 404)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    private function isBuilt(): bool
    {
        return is_file(public_path('index.html'));
    }

    private function notBuilt(): Response
    {
        return response(
            "PakFix is running, but the website has not been built yet.\n\n"
            . "Run this from the backend folder:\n\n    php artisan pakfix:build\n\n"
            . "The API is already available at /api/v1.\n",
            503
        )->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
