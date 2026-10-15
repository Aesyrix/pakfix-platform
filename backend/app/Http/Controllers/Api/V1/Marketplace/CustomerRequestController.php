<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Marketplace;

use App\Enums\QuoteStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Marketplace\StoreJobRequestRequest;
use App\Http\Resources\V1\JobRequestResource;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Services\Marketplace\Bidding;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The customer's side of the marketplace: post a request, watch the offers
 * arrive, accept or decline them, or cancel.
 *
 * A request belonging to someone else answers 404 rather than 403, so the
 * endpoint cannot be used to discover which request ids exist.
 */
class CustomerRequestController extends Controller
{
    public function __construct(private readonly Bidding $bidding)
    {
    }

    /** `GET /requests` — the customer's own requests, newest first. */
    public function index(Request $request): JsonResponse
    {
        $requests = QuoteRequest::query()
            ->where('customer_id', $request->user()->id)
            ->with(['category', 'city', 'area', 'booking'])
            ->latest()
            ->paginate(min($request->integer('per_page', 20), 50));

        return ApiResponse::success(JobRequestResource::collection($requests));
    }

    /** `POST /requests` */
    public function store(StoreJobRequestRequest $request): JsonResponse
    {
        $jobRequest = $this->bidding->postRequest($request->user(), $request->validated());

        return ApiResponse::created(
            new JobRequestResource($jobRequest),
            'Your request is live. Nearby professionals can now send offers.'
        );
    }

    /** `GET /requests/{uuid}` — with every offer received. */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $jobRequest = $this->ownRequest($request, $uuid);
        $jobRequest->load([
            'category', 'city', 'area', 'booking',
            'quotes' => fn ($q) => $q
                ->whereIn('status', [QuoteStatus::Sent->value, QuoteStatus::Accepted->value, QuoteStatus::Rejected->value])
                ->with(['technicianProfile.user', 'technicianProfile.city'])
                ->orderBy('total_minor'),
        ]);

        return ApiResponse::success(new JobRequestResource($jobRequest));
    }

    /** `POST /requests/{uuid}/cancel` */
    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $jobRequest = $this->bidding->cancelRequest($this->ownRequest($request, $uuid));

        return ApiResponse::success(
            new JobRequestResource($jobRequest->load(['category', 'city', 'area'])),
            'Request cancelled.'
        );
    }

    /** `POST /quotes/{uuid}/accept` — books the professional. */
    public function accept(Request $request, string $uuid): JsonResponse
    {
        $booking = $this->bidding->acceptQuote($request->user(), $this->ownQuote($request, $uuid));

        return ApiResponse::success([
            'booking' => [
                'id' => $booking->uuid,
                'reference' => $booking->reference,
                'status' => $booking->status->value,
                'total' => [
                    'minor' => (int) $booking->total_minor,
                    'display' => 'Rs ' . number_format($booking->total_minor / 100),
                ],
            ],
        ], 'Offer accepted. Your professional has been booked.');
    }

    /** `POST /quotes/{uuid}/reject` */
    public function reject(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $this->bidding->rejectQuote($this->ownQuote($request, $uuid), $request->input('reason'));

        return ApiResponse::success(null, 'Offer declined.');
    }

    private function ownRequest(Request $request, string $uuid): QuoteRequest
    {
        return QuoteRequest::query()
            ->where('uuid', $uuid)
            ->where('customer_id', $request->user()->id)
            ->firstOr(fn () => abort(404, 'That request does not exist.'));
    }

    private function ownQuote(Request $request, string $uuid): Quote
    {
        return Quote::query()
            ->where('uuid', $uuid)
            ->where('customer_id', $request->user()->id)
            ->whereNotNull('quote_request_id')
            ->firstOr(fn () => abort(404, 'That offer does not exist.'));
    }
}
