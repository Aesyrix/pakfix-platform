<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\PublishesContent;
use App\Http\Controllers\Controller;
use App\Models\ContentBlock;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Editing the homepage and other page sections.
 *
 * Blocks are edited, not created or deleted, from the dashboard: each one is
 * a slot the frontend renders, so a block with no slot would be invisible and
 * deleting one would leave a hole in a page.
 */
class ContentBlockController extends Controller
{
    use PublishesContent;

    public function index(Request $request): JsonResponse
    {
        $blocks = ContentBlock::query()
            ->when($request->filled('page'), fn ($q) => $q->where('page', $request->string('page')))
            ->orderBy('page')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (ContentBlock $block) => $this->present($block));

        return ApiResponse::success($blocks);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $block = ContentBlock::where('key', $key)->first();

        if (! $block) {
            return ApiResponse::notFound('That content block does not exist.');
        }

        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:200'],
            'subtitle' => ['nullable', 'string', 'max:1000'],
            'cta_label' => ['nullable', 'string', 'max:60', 'required_with:cta_url'],
            'cta_url' => ['nullable', 'string', 'max:255', 'required_with:cta_label', 'regex:/^(\/[^\s]*|https:\/\/[^\s]+)$/'],
            'content' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'cta_url.regex' => 'Use a site path such as /ai, or a full https:// address.',
        ]);

        if (array_key_exists('content', $data)) {
            $data['content'] = $this->sanitiseContent($data['content'] ?? []);
        }

        $original = $block->getOriginal();
        $block->fill($data)->save();

        $this->published('content_block.updated', $block, $original, "Edited the {$block->key} block");

        return ApiResponse::success($this->present($block->fresh()), 'Saved. The change is live.');
    }

    /**
     * Accepts only the shapes the frontend knows how to render: strings,
     * lists of strings, and lists of {title, body} items. Anything else is
     * refused, so a malformed edit cannot break a page.
     */
    private function sanitiseContent(array $content): array
    {
        $clean = [];

        foreach ($content as $key => $value) {
            if (! is_string($key) || ! preg_match('/^[a-z][a-z0-9_]{0,40}$/', $key)) {
                throw ValidationException::withMessages(['content' => "\"{$key}\" is not a valid field name."]);
            }

            if (is_string($value) || $value === null) {
                $clean[$key] = mb_substr((string) $value, 0, 2000);
                continue;
            }

            if (! is_array($value) || count($value) > 30) {
                throw ValidationException::withMessages(['content' => "\"{$key}\" must be text or a list of up to 30 items."]);
            }

            // A blank row in the editor arrives as null (Laravel turns empty
            // strings into nulls), so nulls count as empty items, not bad input.
            if (array_is_list($value) && collect($value)->every(fn ($item) => is_string($item) || $item === null)) {
                $clean[$key] = collect($value)
                    ->map(fn (?string $item) => mb_substr(trim((string) $item), 0, 300))
                    ->filter()
                    ->values()
                    ->all();
                continue;
            }

            if (array_is_list($value) && collect($value)->every(fn ($item) => is_array($item) && isset($item['title']))) {
                $clean[$key] = collect($value)
                    ->map(fn (array $item) => [
                        'title' => mb_substr(trim((string) $item['title']), 0, 160),
                        'body' => mb_substr(trim((string) ($item['body'] ?? '')), 0, 1000),
                    ])
                    ->filter(fn (array $item) => $item['title'] !== '')
                    ->values()
                    ->all();
                continue;
            }

            if (! array_is_list($value) && collect($value)->every(fn ($item) => is_string($item) || $item === null)) {
                // A flat map, such as social links.
                $clean[$key] = collect($value)->map(fn ($item) => mb_substr((string) $item, 0, 500))->all();
                continue;
            }

            throw ValidationException::withMessages(['content' => "\"{$key}\" has a shape this block cannot display."]);
        }

        return $clean;
    }

    private function present(ContentBlock $block): array
    {
        return [
            'key' => $block->key,
            'type' => $block->type,
            'page' => $block->page,
            'title' => $block->title,
            'subtitle' => $block->subtitle,
            'content' => $block->content ?? (object) [],
            'cta_label' => $block->cta_label,
            'cta_url' => $block->cta_url,
            'sort_order' => $block->sort_order,
            'is_active' => $block->is_active,
            'updated_at' => $block->updated_at?->toIso8601String(),
        ];
    }
}
