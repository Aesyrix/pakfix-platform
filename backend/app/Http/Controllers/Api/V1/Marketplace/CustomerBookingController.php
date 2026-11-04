<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Marketplace;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BookingResource;
use App\Models\Booking;
use App\Services\Marketplace\BookingFlow;
use App\Services\Marketplace\CompletionCode;
use App\Services\Marketplace\JobCompletion;
use App\Services\Marketplace\Reviews;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The customer's bookings: follow the job, approve or decline a revised
 * price, confirm it is done, or cancel while that is still free.
 * Someone else's booking answers 404.
 */
class CustomerBookingController extends Controller
{
    private const WITH = ['category', 'city', 'technicianProfile.user', 'statusHistory', 'quotes', 'review', 'disputes'];

    public function __construct(
        private readonly BookingFlow $flow,
        private readonly Reviews $reviews,
        private readonly JobCompletion $completion,
    ) {
    }

    /** `GET /bookings` — active jobs first, then the rest, newest first. */
    public function index(Request $request): JsonResponse
    {
        $this->completion->settleFor(Booking::query()->forCustomer($request->user()->id));

        $bookings = Booking::query()
            ->forCustomer($request->user()->id)
            ->with(['category', 'city', 'technicianProfile.user', 'quotes', 'disputes'])
            ->orderByRaw("case when status in ('customer_confirmed','cancelled','refunded') then 1 else 0 end")
            ->latest()
            ->paginate(min($request->integer('per_page', 20), 50));

        $bookings->getCollection()->transform(fn (Booking $b) => (new BookingResource($b))->forRole('customer'));

        return ApiResponse::success($bookings);
    }

    /** `GET /bookings/{uuid}` */
    public function show(Request $request, string $uuid): JsonResponse
    {
        return $this->respond($this->own($request, $uuid));
    }

    /** `POST /bookings/{uuid}/cancel` — free until the professional sets off. */
    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);
        $booking = $this->flow->cancel($this->own($request, $uuid), $request->user(), 'customer', $request->input('reason'));

        return $this->respond($booking, 'Booking cancelled.');
    }

    /** `POST /bookings/{uuid}/confirm` — the work is done and paid in cash. */
    public function confirm(Request $request, string $uuid): JsonResponse
    {
        $booking = $this->flow->confirm($this->own($request, $uuid), $request->user());

        return $this->respond($booking, 'Thanks for confirming. The job is complete.');
    }

    /** `POST /bookings/{uuid}/done` — the work is done and paid, even if the professional has not said so. */
    public function markDone(Request $request, string $uuid): JsonResponse
    {
        $booking = $this->flow->markDone($this->own($request, $uuid), $request->user());

        return $this->respond($booking, 'Thanks for confirming. The job is complete.');
    }

    /** `POST /bookings/{uuid}/dispute` — `{ kind: problem|no_show, description }`; PakFix decides. */
    public function dispute(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(['problem', 'no_show'])],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
        ], ['description.min' => 'Tell us a little more about what went wrong.']);

        $booking = $this->own($request, $uuid);
        $this->completion->openDispute($booking, $request->user(), 'customer', $data['kind'], $data['description']);

        return $this->respond($booking, 'Thanks. PakFix will look into it and get back to you within 24 hours.');
    }

    /** `POST /bookings/{uuid}/revised-quote/accept` */
    public function acceptQuote(Request $request, string $uuid): JsonResponse
    {
        $booking = $this->flow->acceptRevisedQuote($this->own($request, $uuid), $request->user());

        return $this->respond($booking, 'Revised price approved. The work can continue.');
    }

    /** `POST /bookings/{uuid}/revised-quote/reject` — ends the job; only the visit fee is due. */
    public function rejectQuote(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);
        $booking = $this->flow->rejectRevisedQuote($this->own($request, $uuid), $request->user(), $request->input('reason'));

        return $this->respond($booking, 'Revised price declined. Only the visit fee is due.');
    }

    /** `POST /bookings/{uuid}/review` — once, after confirming the job. */
    public function review(Request $request, string $uuid): JsonResponse
    {
        $score = ['nullable', 'integer', 'between:1,5'];
        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'quality_rating' => $score,
            'professionalism_rating' => $score,
            'communication_rating' => $score,
            'value_rating' => $score,
            'timeliness_rating' => $score,
            'comment' => ['nullable', 'string', 'max:2000'],
            'would_recommend' => ['nullable', 'boolean'],
        ], ['rating.required' => 'Choose a star rating.']);

        $booking = $this->own($request, $uuid);
        $this->reviews->create($booking, $request->user(), $data);

        return $this->respond($booking, 'Thanks for your review.');
    }

    private function own(Request $request, string $uuid): Booking
    {
        $booking = Booking::query()
            ->where('uuid', $uuid)
            ->where('customer_id', $request->user()->id)
            ->firstOr(fn () => abort(404, 'That booking does not exist.'));

        CompletionCode::ensure($booking);

        return $this->completion->settle($booking);
    }

    private function respond(Booking $booking, string $message = 'OK'): JsonResponse
    {
        $booking->refresh()->load(self::WITH);

        return ApiResponse::success((new BookingResource($booking))->forRole('customer'), $message);
    }
}
