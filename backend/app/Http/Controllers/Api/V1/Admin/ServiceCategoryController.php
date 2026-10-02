<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\PublishesContent;
use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\ServiceCategory;
use App\Support\ApiResponse;
use App\Support\ReservedPaths;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Managing the service catalogue.
 *
 * Categories are deactivated rather than deleted: bookings, quotes and
 * reviews reference them, and a job history that suddenly says "unknown
 * service" helps nobody.
 */
class ServiceCategoryController extends Controller
{
    use PublishesContent;

    public function index(): JsonResponse
    {
        $categories = ServiceCategory::query()
            ->with('parent:id,name,slug')
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (ServiceCategory $category) => $this->present($category));

        return ApiResponse::success($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);

        $category = ServiceCategory::create($data);
        $this->published('service_category.created', $category, [], "Created the {$category->name} category");

        return ApiResponse::created($this->present($category->load('parent')), 'Category created.');
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $category = ServiceCategory::where('uuid', $uuid)->first();

        if (! $category) {
            return ApiResponse::notFound('That category does not exist.');
        }

        $data = $this->validated($request, $category);

        if (($data['parent_id'] ?? null) === $category->id) {
            return ApiResponse::validationFailed(['parent_slug' => ['A category cannot be its own parent.']]);
        }

        $original = $category->getOriginal();
        $category->fill($data)->save();

        $this->published('service_category.updated', $category, $original, "Edited the {$category->name} category");

        return ApiResponse::success($this->present($category->load('parent')), 'Category saved.');
    }

    private function validated(Request $request, ?ServiceCategory $category = null): array
    {
        $required = $category ? 'sometimes' : 'required';

        $data = $request->validate([
            'name' => [$required, 'string', 'min:2', 'max:80'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:80', 'alpha_dash', Rule::unique('service_categories', 'slug')->ignore($category?->id)],
            'parent_slug' => ['nullable', 'string', 'exists:service_categories,slug'],
            'trade_slug' => [
                'nullable', 'string', 'max:64', 'alpha_dash',
                Rule::unique('service_categories', 'trade_slug')->ignore($category?->id),
                $this->notACollidingPath(),
            ],
            'trade_name' => ['nullable', 'string', 'max:80', 'required_with:trade_slug'],
            'description' => ['nullable', 'string', 'max:1000'],
            'common_problems' => ['nullable', 'array', 'max:12'],
            'common_problems.*' => ['string', 'min:3', 'max:160'],
            'icon' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9-]+$/'],
            'is_emergency' => ['nullable', 'boolean'],
            'is_popular' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'typical_min_rupees' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'typical_max_rupees' => ['nullable', 'integer', 'min:0', 'max:100000000', 'gte:typical_min_rupees'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:320'],
        ]);

        if ($request->exists('parent_slug')) {
            $data['parent_id'] = $data['parent_slug']
                ? ServiceCategory::where('slug', $data['parent_slug'])->value('id')
                : null;
        }

        // Rupees in, minor units stored. Admins should never have to think
        // about minor units.
        foreach (['typical_min' => 'typical_min_rupees', 'typical_max' => 'typical_max_rupees'] as $column => $input) {
            if ($request->exists($input)) {
                $data["{$column}_minor"] = $data[$input] === null ? null : $data[$input] * 100;
            }
            unset($data[$input]);
        }

        if (array_key_exists('common_problems', $data) && is_array($data['common_problems'])) {
            $data['common_problems'] = array_values(array_filter(array_map('trim', $data['common_problems'])));
        }

        unset($data['parent_slug']);

        return $data;
    }

    /** A trade slug lives at the root of the site, so it must not shadow anything there. */
    private function notACollidingPath(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if ($value === null || $value === '') {
                return;
            }

            if (ReservedPaths::isReserved($value)) {
                $fail("\"{$value}\" is already used by a page on the site.");
            }

            if (City::where('slug', $value)->exists()) {
                $fail("\"{$value}\" is a city name, which would clash with that city's page.");
            }
        };
    }

    private function uniqueSlug(string $source): string
    {
        $base = Str::slug($source) ?: 'service';
        $slug = $base;
        $suffix = 1;

        while (ServiceCategory::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base . '-' . ++$suffix;
        }

        return $slug;
    }

    private function present(ServiceCategory $category): array
    {
        return [
            'id' => $category->uuid,
            'name' => $category->name,
            'slug' => $category->slug,
            'parent' => $category->relationLoaded('parent') && $category->parent
                ? ['name' => $category->parent->name, 'slug' => $category->parent->slug]
                : null,
            'trade_slug' => $category->trade_slug,
            'trade_name' => $category->trade_name,
            'description' => $category->description,
            'common_problems' => $category->common_problems ?? [],
            'icon' => $category->icon,
            'is_emergency' => (bool) $category->is_emergency,
            'is_popular' => (bool) $category->is_popular,
            'is_active' => (bool) $category->is_active,
            'sort_order' => $category->sort_order,
            'typical_min_rupees' => $category->typical_min_minor === null ? null : intdiv($category->typical_min_minor, 100),
            'typical_max_rupees' => $category->typical_max_minor === null ? null : intdiv($category->typical_max_minor, 100),
            'seo_title' => $category->seo_title,
            'seo_description' => $category->seo_description,
        ];
    }
}
