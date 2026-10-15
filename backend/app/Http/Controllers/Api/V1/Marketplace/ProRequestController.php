<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Marketplace;

use App\Enums\QuoteStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Marketplace\StoreQuoteRequest;
use App\Http\Resources\V1\JobRequestResource;
use App\Http\Resources\V1\QuoteResource;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\TechnicianProfile;
use App\Services\Marketplace\Bidding;
use App\Services\Marketplace\RequestMatcher;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The professional's side: nearby requests, sending offers, and their own
 * offers. Only verified professionals get past `profile()`.
 */
class ProRequestController extends Controller
{
    public function __construct(
        private readonly RequestMatcher $matcher,
        private readonly Bidding $bidding,
    ) {
    }

    /** `GET /pro/requests` — open requests in reach, nearest first. */
    public function nearby(Request $request): JsonResponse
    {
        $profile = $this->profile($request);
        $requests = $this->matcher->nearby($profile);
        $this->attachMyQuotes($profile, $requests->all());

        return ApiResponse::success(JobRequestResource::collection($requests), meta: [
            'radius_km' => $this->matcher->radiusFor($profile),
        ]);
    }

    /** `GET /pro/requests/{uuid}` */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $profile = $this->profile($request);
        $jobRequest = QuoteRequest::where('uuid', $uuid)->with(['category', 'city', 'area', 'customer'])->firstOrFail();

        $hasQuoted = $jobRequest->quotes()->where('technician_profile_id', $profile->id)->exists();
        if (! $hasQuoted && ! $this->matcher->canBid($profile, $jobRequest)) {
            abort(404, 'That request is not available.');
        }

        $jobRequest->setAttribute('distance_km', $profile->distanceTo($jobRequest->latitude, $jobRequest->longitude));
        $this->attachMyQuotes($profile, [$jobRequest]);

        return ApiResponse::success(new JobRequestResource($jobRequest));
    }

    /** `POST /pro/requests/{uuid}/quotes` */
    public function quote(StoreQuoteRequest $request, string $uuid): JsonResponse
    {
        $profile = $this->profile($request);
        $jobRequest = QuoteRequest::where('uuid', $uuid)->firstOrFail();

        $quote = $this->bidding->placeQuote($profile, $jobRequest, $request->validated());

        return ApiResponse::created(new QuoteResource($quote), 'Offer sent. The customer will see it right away.');
    }

    /** `GET /pro/quotes` — this professional's offers, newest first. */
    public function myQuotes(Request $request): JsonResponse
    {
        $profile = $this->profile($request, requireVerified: false);

        $quotes = Quote::query()
            ->where('technician_profile_id', $profile->id)
            ->whereNotNull('quote_request_id')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->with(['request.category', 'request.city', 'request.area', 'booking'])
            ->latest()
            ->paginate(min($request->integer('per_page', 20), 50));

        return ApiResponse::success(QuoteResource::collection($quotes));
    }

    /** `POST /pro/quotes/{uuid}/withdraw` */
    public function withdraw(Request $request, string $uuid): JsonResponse
    {
        $profile = $this->profile($request, requireVerified: false);
        $quote = Quote::where('uuid', $uuid)->where('technician_profile_id', $profile->id)->firstOrFail();

        return ApiResponse::success(new QuoteResource($this->bidding->withdrawQuote($quote)), 'Offer withdrawn.');
    }

    private function profile(Request $request, bool $requireVerified = true): TechnicianProfile
    {
        $profile = $request->user()->technicianProfile;

        if ($profile === null) {
            abort(403, 'Set up your professional profile to see nearby jobs.');
        }

        if ($requireVerified && ! $profile->isVerified()) {
            abort(403, 'Your account is awaiting verification. You will see nearby jobs once PakFix verifies your CNIC.');
        }

        return $profile;
    }

    /** @param list<QuoteRequest> $requests */
    private function attachMyQuotes(TechnicianProfile $profile, array $requests): void
    {
        if ($requests === []) {
            return;
        }

        $mine = Quote::query()
            ->where('technician_profile_id', $profile->id)
            ->whereIn('quote_request_id', array_map(fn (QuoteRequest $r) => $r->id, $requests))
            ->whereIn('status', [QuoteStatus::Sent->value, QuoteStatus::Accepted->value, QuoteStatus::Rejected->value])
            ->latest()
            ->get()
            ->unique('quote_request_id')
            ->keyBy('quote_request_id');

        foreach ($requests as $r) {
            $r->setRelation('myQuote', $mine->get($r->id));
        }
    }
}
