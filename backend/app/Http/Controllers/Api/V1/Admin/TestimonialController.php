<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\PublishesContent;
use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Homepage testimonials.
 *
 * These are curated marketing quotes, distinct from verified reviews, which
 * are tied to completed bookings and cannot be written by staff.
 */
class TestimonialController extends Controller
{
    use PublishesContent;

    public function index(): JsonResponse
    {
        return ApiResponse::success(
            Testimonial::orderBy('sort_order')->get()->map(fn (Testimonial $t) => $this->present($t))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $testimonial = Testimonial::create($this->validated($request));

        $this->published('testimonial.created', $testimonial, [], 'Added a testimonial');

        return ApiResponse::created($this->present($testimonial), 'Testimonial added.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (! $testimonial) {
            return ApiResponse::notFound('That testimonial does not exist.');
        }

        $original = $testimonial->getOriginal();
        $testimonial->fill($this->validated($request, partial: true))->save();

        $this->published('testimonial.updated', $testimonial, $original, 'Edited a testimonial');

        return ApiResponse::success($this->present($testimonial), 'Testimonial saved.');
    }

    public function destroy(int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (! $testimonial) {
            return ApiResponse::notFound('That testimonial does not exist.');
        }

        $testimonial->delete();
        $this->unpublished('testimonial.deleted', $testimonial, 'Deleted a testimonial');

        return ApiResponse::success(null, 'Testimonial deleted.');
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return array_filter($request->validate([
            'author_name' => [$required, 'string', 'min:2', 'max:80'],
            'author_location' => ['nullable', 'string', 'max:80'],
            'rating' => [$required, 'integer', 'between:1,5'],
            'quote' => [$required, 'string', 'min:10', 'max:600'],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]), fn ($value) => $value !== null);
    }

    private function present(Testimonial $testimonial): array
    {
        return [
            'id' => $testimonial->id,
            'author_name' => $testimonial->author_name,
            'author_location' => $testimonial->author_location,
            'rating' => $testimonial->rating,
            'quote' => $testimonial->quote,
            'is_published' => (bool) $testimonial->is_published,
            'sort_order' => $testimonial->sort_order,
        ];
    }
}
