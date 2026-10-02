<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\PublishesContent;
use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Faq;
use App\Models\ServiceCategory;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * FAQs for the marketing site, service pages and city pages.
 *
 * A FAQ with no service and no city is a general one and appears on the
 * homepage and /faq; attaching a service or city moves it to that page.
 */
class FaqController extends Controller
{
    use PublishesContent;

    public function index(Request $request): JsonResponse
    {
        $faqs = Faq::query()
            ->with(['category:id,name,slug', 'city:id,name,slug'])
            ->when($request->filled('group'), fn ($q) => $q->where('group', $request->string('group')))
            ->orderBy('group')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Faq $faq) => $this->present($faq));

        return ApiResponse::success($faqs);
    }

    public function store(Request $request): JsonResponse
    {
        $faq = Faq::create($this->validated($request));

        $this->published('faq.created', $faq, [], 'Added a FAQ');

        return ApiResponse::created($this->present($faq->load(['category', 'city'])), 'FAQ added.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return ApiResponse::notFound('That FAQ does not exist.');
        }

        $original = $faq->getOriginal();
        $faq->fill($this->validated($request, partial: true))->save();

        $this->published('faq.updated', $faq, $original, 'Edited a FAQ');

        return ApiResponse::success($this->present($faq->load(['category', 'city'])), 'FAQ saved.');
    }

    public function destroy(int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return ApiResponse::notFound('That FAQ does not exist.');
        }

        $faq->delete();
        $this->unpublished('faq.deleted', $faq, 'Deleted a FAQ');

        return ApiResponse::success(null, 'FAQ deleted.');
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        $data = $request->validate([
            'question' => [$required, 'string', 'min:5', 'max:255'],
            'answer' => [$required, 'string', 'min:5', 'max:3000'],
            'group' => ['nullable', 'string', 'in:general,safety,payments,service,professionals,city'],
            'service_category_slug' => ['nullable', 'string', 'exists:service_categories,slug'],
            'city_slug' => ['nullable', 'string', 'exists:cities,slug'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($request->exists('service_category_slug')) {
            $data['service_category_id'] = $data['service_category_slug']
                ? ServiceCategory::where('slug', $data['service_category_slug'])->value('id')
                : null;
        }

        if ($request->exists('city_slug')) {
            $data['city_id'] = $data['city_slug'] ? City::where('slug', $data['city_slug'])->value('id') : null;
        }

        unset($data['service_category_slug'], $data['city_slug']);

        if (! $partial) {
            $data['group'] ??= 'general';
        }

        return array_filter($data, fn ($value, $key) => $value !== null || in_array($key, ['service_category_id', 'city_id'], true), ARRAY_FILTER_USE_BOTH);
    }

    private function present(Faq $faq): array
    {
        return [
            'id' => $faq->id,
            'question' => $faq->question,
            'answer' => $faq->answer,
            'group' => $faq->group,
            'service_category' => $faq->category ? ['name' => $faq->category->name, 'slug' => $faq->category->slug] : null,
            'city' => $faq->city ? ['name' => $faq->city->name, 'slug' => $faq->city->slug] : null,
            'sort_order' => $faq->sort_order,
            'is_active' => (bool) $faq->is_active,
        ];
    }
}
