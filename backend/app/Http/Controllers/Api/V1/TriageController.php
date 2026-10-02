<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Public\TriageRequest;
use App\Http\Resources\V1\ServiceCategoryResource;
use App\Services\Triage\ProblemTriage;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * `POST /ai/triage` -- the first look at a problem description.
 *
 * This is safety screening and service matching, not a diagnosis. The
 * response says so explicitly, so no client can present it as the AI
 * diagnosis that arrives in Phase 4.
 */
class TriageController extends Controller
{
    public function __construct(private readonly ProblemTriage $triage)
    {
    }

    public function __invoke(TriageRequest $request): JsonResponse
    {
        $result = $this->triage->triage($request->string('description')->toString());

        return ApiResponse::success([
            'kind' => 'triage',
            'is_emergency' => $result['is_emergency'],
            'emergency' => $result['emergency'] === null ? null : [
                'type' => $result['emergency']['type'],
                'title' => $result['emergency']['title'],
                'headline' => 'Do not attempt this repair yourself.',
                'steps' => $result['emergency']['steps'],
                'emergency_numbers' => [
                    ['label' => 'Rescue 1122', 'number' => '1122'],
                    ['label' => 'Fire brigade', 'number' => '16'],
                    ['label' => 'Police', 'number' => '15'],
                ],
            ],
            'safety_level' => $result['safety_level'],
            'matches' => collect($result['matches'])->map(fn (array $match) => [
                'category' => (new ServiceCategoryResource($match['category']))->resolve($request),
                'confidence' => $match['confidence'],
                'matched_terms' => $match['matched_terms'],
            ])->all(),
            'disclaimer' => 'This is an automatic first check based on the words you used. It is not a diagnosis. A professional confirms the cause on site.',
        ]);
    }
}
