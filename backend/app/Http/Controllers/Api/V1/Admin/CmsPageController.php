<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\PublishesContent;
use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Support\ApiResponse;
use App\Support\Markdown;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Standalone pages: About, Terms, Privacy, Refunds, Safety.
 *
 * System pages can be edited but never deleted or renamed -- the site links
 * to them by slug, and legal pages must always exist.
 */
class CmsPageController extends Controller
{
    use PublishesContent;

    public function index(): JsonResponse
    {
        return ApiResponse::success(
            CmsPage::orderBy('title')->get()->map(fn (CmsPage $page) => $this->present($page, withBody: false))
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $page = CmsPage::where('uuid', $uuid)->first();

        return $page
            ? ApiResponse::success($this->present($page))
            : ApiResponse::notFound('That page does not exist.');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'min:2', 'max:160'],
            'slug' => ['nullable', 'string', 'max:120', 'alpha_dash', 'unique:cms_pages,slug'],
            'body' => ['nullable', 'string', 'max:100000'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = Str::slug($data['slug'] ?? $data['title']);
        $data['is_system'] = false;

        $page = CmsPage::create($data);
        $this->published('cms_page.created', $page, [], "Created the {$page->title} page");

        return ApiResponse::created($this->present($page), 'Page created.');
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $page = CmsPage::where('uuid', $uuid)->first();

        if (! $page) {
            return ApiResponse::notFound('That page does not exist.');
        }

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'min:2', 'max:160'],
            'slug' => [
                'sometimes', 'string', 'max:120', 'alpha_dash',
                Rule::unique('cms_pages', 'slug')->ignore($page->id),
            ],
            'body' => ['nullable', 'string', 'max:100000'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        // The site links to system pages by slug, and legal pages must stay up.
        if ($page->is_system) {
            unset($data['slug']);
            $data['is_published'] = true;
        }

        $original = $page->getOriginal();
        $page->fill($data)->save();

        $this->published('cms_page.updated', $page, $original, "Edited the {$page->title} page");

        return ApiResponse::success($this->present($page), 'Page saved. The change is live.');
    }

    public function destroy(string $uuid): JsonResponse
    {
        $page = CmsPage::where('uuid', $uuid)->first();

        if (! $page) {
            return ApiResponse::notFound('That page does not exist.');
        }

        if (! $page->isDeletable()) {
            return ApiResponse::error('This is a system page. It can be edited but not deleted.', 422);
        }

        $page->delete();
        $this->unpublished('cms_page.deleted', $page, "Deleted the {$page->title} page");

        return ApiResponse::success(null, 'Page deleted.');
    }

    private function present(CmsPage $page, bool $withBody = true): array
    {
        return array_filter([
            'id' => $page->uuid,
            'title' => $page->title,
            'slug' => $page->slug,
            'body' => $withBody ? (string) $page->body : null,
            'body_html' => $withBody ? Markdown::toHtml($page->body) : null,
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
            'is_system' => (bool) $page->is_system,
            'is_published' => (bool) $page->is_published,
            'updated_at' => $page->updated_at?->toIso8601String(),
        ], fn ($value, $key) => $value !== null || ! in_array($key, ['body', 'body_html'], true), ARRAY_FILTER_USE_BOTH);
    }
}
