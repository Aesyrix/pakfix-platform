<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Models\ContentBlock;
use App\Models\Faq;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Support\ApiResponse;
use App\Support\ContentCache;
use App\Support\Markdown;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Editable marketing content, plus the public bootstrap payload the frontend
 * fetches once on load.
 *
 * Nothing here requires authentication and nothing here may contain a secret:
 * the bootstrap endpoint filters settings down to the rows explicitly marked
 * public, so adding a credential to the settings table can never leak it into
 * the browser.
 */
class ContentController extends Controller
{
    private const CACHE_TTL = 600;

    /** Everything the frontend needs before it renders anything. */
    public function bootstrap(): JsonResponse
    {
        $payload = ContentCache::remember('content:bootstrap', self::CACHE_TTL, function (): array {
            $settings = Setting::where('is_public', true)
                ->where('is_secret', false)
                ->get()
                ->mapWithKeys(fn (Setting $s) => [$s->key => $s->typedValue()])
                ->all();

            return [
                'brand' => [
                    'name' => $settings['platform.name'] ?? config('pakfix.brand.name'),
                    'tagline' => $settings['platform.tagline'] ?? config('pakfix.brand.tagline'),
                    'support_email' => $settings['platform.support_email'] ?? config('pakfix.brand.support_email'),
                    'support_phone' => $settings['platform.support_phone'] ?? config('pakfix.brand.support_phone'),
                    'whatsapp' => ($settings['platform.whatsapp'] ?? '') ?: null,
                    'address' => ($settings['platform.address'] ?? '') ?: null,
                    'support_hours' => ($settings['platform.support_hours'] ?? '') ?: null,
                ],
                'social' => collect(['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'])
                    ->mapWithKeys(fn (string $network) => [$network => ($settings["social.{$network}"] ?? '') ?: null])
                    ->filter()
                    ->all(),
                'currency' => [
                    'code' => $settings['platform.currency'] ?? config('pakfix.currency.default'),
                    'symbol' => config('pakfix.currency.symbol'),
                ],
                'features' => [
                    'ai_enabled' => (bool) ($settings['ai.enabled'] ?? config('ai.enabled')),
                    'maintenance_mode' => (bool) ($settings['platform.maintenance_mode'] ?? false),
                ],
                'payment_methods' => array_keys(array_filter([
                    'cash' => (bool) ($settings['payments.cash_enabled'] ?? true),
                    'bank_transfer' => (bool) ($settings['payments.bank_transfer_enabled'] ?? true),
                    'jazzcash' => (bool) ($settings['payments.jazzcash_enabled'] ?? false),
                    'easypaisa' => (bool) ($settings['payments.easypaisa_enabled'] ?? false),
                    'card' => (bool) ($settings['payments.card_enabled'] ?? false),
                ])),
                'seo' => [
                    'default_title' => $settings['seo.default_title'] ?? null,
                    'default_description' => $settings['seo.default_description'] ?? null,
                ],
            ];
        });

        return ApiResponse::success($payload);
    }

    /** The editable blocks for one page, keyed for direct lookup. */
    public function blocks(Request $request): JsonResponse
    {
        $page = $request->string('page')->toString() ?: 'home';

        $blocks = ContentCache::remember('content:blocks:' . $page, self::CACHE_TTL, fn () => ContentBlock::active()
            ->forPage($page)
            ->get()
            ->mapWithKeys(fn (ContentBlock $block) => [
                $block->key => [
                    'type' => $block->type,
                    'title' => $block->title,
                    'subtitle' => $block->subtitle,
                    'content' => $block->content,
                    'image_url' => $block->image_path ? Storage::url($block->image_path) : null,
                    'cta' => $block->cta_label ? [
                        'label' => $block->cta_label,
                        'url' => $block->cta_url,
                    ] : null,
                ],
            ])
            ->all());

        return ApiResponse::success((object) $blocks);
    }

    /** `?group=` narrows to one group; with no group, the general marketing set. */
    public function faqs(Request $request): JsonResponse
    {
        $group = $request->string('group')->toString();

        $faqs = ContentCache::remember('content:faqs:' . ($group ?: 'general'), self::CACHE_TTL, fn () => Faq::active()
            ->when(
                $group,
                fn ($q) => $q->where('group', $group),
                fn ($q) => $q->general()
            )
            ->get(['question', 'answer', 'group'])
            ->toArray());

        return ApiResponse::success($faqs);
    }

    public function testimonials(): JsonResponse
    {
        $testimonials = ContentCache::remember('content:testimonials', self::CACHE_TTL, fn () => Testimonial::published()
            ->get(['author_name', 'author_location', 'rating', 'quote'])
            ->toArray());

        return ApiResponse::success($testimonials);
    }

    public function page(string $slug): JsonResponse
    {
        $payload = ContentCache::remember("content:page:{$slug}", self::CACHE_TTL, function () use ($slug): ?array {
            $page = CmsPage::published()->where('slug', $slug)->first();

            if (! $page) {
                return null;
            }

            return [
                'title' => $page->title,
                'slug' => $page->slug,
                // Markdown source for the admin editor, rendered HTML for display.
                'body' => $page->body,
                'body_html' => Markdown::toHtml($page->body),
                'seo' => [
                    'title' => $page->seo_title ?: $page->title,
                    'description' => $page->seo_description ?: Markdown::excerpt($page->body),
                ],
                'updated_at' => $page->updated_at?->toIso8601String(),
            ];
        });

        return $payload === null
            ? ApiResponse::notFound('That page does not exist.')
            : ApiResponse::success($payload);
    }
}
