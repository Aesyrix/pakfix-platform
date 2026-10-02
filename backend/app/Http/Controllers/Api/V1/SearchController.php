<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BlogPostCardResource;
use App\Http\Resources\V1\ServiceCategoryResource;
use App\Http\Resources\V1\ServiceResource;
use App\Http\Resources\V1\TechnicianCardResource;
use App\Services\Search\SearchService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Global search across the public catalogue. `GET /search?q=` */
class SearchController extends Controller
{
    public function __construct(private readonly SearchService $search)
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:' . SearchService::MIN_LENGTH, 'max:120'],
        ]);

        $results = $this->search->search($request->string('q')->toString());

        return ApiResponse::success([
            'query' => $request->string('q')->toString(),
            'categories' => ServiceCategoryResource::collection($results['categories'])->resolve($request),
            'services' => ServiceResource::collection($results['services'])->resolve($request),
            'professionals' => TechnicianCardResource::collection($results['technicians'])->resolve($request),
            'posts' => BlogPostCardResource::collection($results['posts'])->resolve($request),
            'faqs' => $results['faqs']->map(fn ($faq) => [
                'question' => $faq->question,
                'answer' => $faq->answer,
            ])->values()->all(),
        ]);
    }
}
