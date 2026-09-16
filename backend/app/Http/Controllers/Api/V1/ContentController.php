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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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

    /**
     * Everything the frontend needs before it renders anything: brand, enabled
     * payment methods, whether the assistant is switched on.
     */
    public function bootstrap(): JsonResponse
    {
        $payload = Cache::remember('content:bootstrap', self::CACHE_TTL, function (): array {
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
                    'whatsapp' => $settings['platform.whatsapp'] ?? null,
                ],
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

        $blocks = Cache::remember(
            'content:blocks:' . $page,
            self::CACHE_TTL,
            fn () => ContentBlock::active()->forPage($page)->get()
        );

        return ApiResponse::success(
            $blocks->mapWithKeys(fn (ContentBlock $block) => [
                $block->key => [
                    'type' => $block->type,
                    'title' => $block->title,
                    'subtitle' => $block->subtitle,
                    'content' => $block->content,
                    'image_url' => $block->image_path
                        ? \Illuminate\Support\Facades\Storage::url($block->image_path)
                        : null,
                    'cta' => $block->cta_label ? [
                        'label' => $block->cta_label,
                        'url' => $block->cta_url,
                    ] : null,
                ],
            ])
        );
    }

    public function faqs(Request $request): JsonResponse
    {
        $faqs = Faq::active()
            ->when(
                $group = $request->string('group')->toString(),
                fn ($q) => $q->where('group', $group),
                fn ($q) => $q->general()
            )
            ->get(['question', 'answer', 'group']);

        return ApiResponse::success($faqs);
    }

    public function testimonials(): JsonResponse
    {
        $testimonials = Cache::remember(
            'content:testimonials',
            self::CACHE_TTL,
            fn () => Testimonial::published()->get([
                'author_name', 'author_location', 'rating', 'quote',
            ])
        );

        return ApiResponse::success($testimonials);
    }

    public function page(string $slug): JsonResponse
    {
        $page = CmsPage::published()->where('slug', $slug)->first();

        if (! $page) {
            return ApiResponse::notFound('That page does not exist.');
        }

        return ApiResponse::success([
            'title' => $page->title,
            'slug' => $page->slug,
            'body' => $page->body,
            'seo' => [
                'title' => $page->seo_title ?: $page->title,
                'description' => $page->seo_description,
            ],
            'updated_at' => $page->updated_at?->toIso8601String(),
        ]);
    }
}
