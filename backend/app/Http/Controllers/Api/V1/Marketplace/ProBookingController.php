<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Marketplace;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BookingResource;
use App\Models\Booking;
use App\Models\TechnicianProfile;
use App\Services\Marketplace\BookingFlow;
use App\Services\Marketplace\JobCompletion;
use App\Services\Marketplace\Reviews;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The professional's booked jobs: move each one forward step by step, send a
 * revised price after inspecting, or cancel before arriving.
 * A job assigned to someone else answers 404.
 */
class ProBookingController extends Controller
{
    private const WITH = ['category', 'city', 'customer', 'statusHistory', 'quotes', 'review', 'disputes'];

    public function __construct(
        private readonly BookingFlow $flow,
        private readonly Reviews $reviews,
        private readonly JobCompletion $completion,
    ) {
    }

    /** `GET /pro/bookings` — active jobs first, then the rest, newest first. */
    public function index(Request $request): JsonResponse
    {
        $this->completion->settleFor(Booking::query()->forTechnician($this->profile($request)->id));

        $bookings = Booking::query()
            ->forTechnician($this->profile($request)->id)
            ->with(['category', 'city', 'customer', 'quotes', 'disputes'])
            ->orderByRaw("case when status in ('customer_confirmed','cancelled','refunded') then 1 else 0 end")
            ->latest()
            ->paginate(min($request->integer('per_page', 20), 50));

        $bookings->getCollection()->transform(fn (Booking $b) => (new BookingResource($b))->forRole('technician'));

        return ApiResponse::success($bookings);
    }

    /** `GET /pro/bookings/{uuid}` */
    public function show(Request $request, string $uuid): JsonResponse
    {
        return $this->respond($this->assigned($request, $uuid));
    }

    /** `POST /pro/bookings/{uuid}/status` — `{ "step": "on_way" | "arrived" | "inspecting" | "working" | "completed" }` */
    public function advance(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'step' => ['required', Rule::in(array_keys(BookingFlow::PRO_STEPS))],
            'note' => ['nullable', 'string', 'max:500'],
            // The customer's completion code, with step "completed".
            'code' => ['nullable', 'string', 'max:8'],
            // Where the professional is, with "arrived" and "completed".
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
        ]);

        $booking = $this->flow->advance(
            $this->assigned($request, $uuid),
            $this->profile($request),
            $request->user(),
            $data['step'],
            $data['note'] ?? null,
            $data['code'] ?? null,
            isset($data['latitude']) ? (float) $data['latitude'] : null,
            isset($data['longitude']) ? (float) $data['longitude'] : null,
        );

        $message = match ($booking->status->value) {
            'customer_confirmed' => 'Job complete. Well done!',
            'completed' => 'Job marked done. The customer will confirm it.',
            default => 'Job updated.',
        };

        return $this->respond($booking, $message);
    }

    /** `POST /pro/bookings/{uuid}/dispute` — `{ kind: not_paid|problem, description }`; PakFix decides. */
    public function dispute(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(['not_paid', 'problem'])],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
        ], ['description.min' => 'Tell us a little more about what happened.']);

        $booking = $this->assigned($request, $uuid);
        $this->completion->openDispute($booking, $request->user(), 'technician', $data['kind'], $data['description']);

        return $this->respond($booking, 'Thanks. PakFix will look into it and get back to you within 24 hours.');
    }

    /** `POST /pro/bookings/{uuid}/revised-quote` — after inspecting; the customer must approve. */
    public function revisedQuote(Request $request, string $uuid): JsonResponse
    {
        $money = ['required', 'integer', 'min:0', 'max:500000000'];
        $data = $request->validate([
            'labour_minor' => $money,
            'materials_minor' => $money,
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking = $this->assigned($request, $uuid);
        $this->flow->reviseQuote($booking, $this->profile($request), $request->user(), $data);

        return $this->respond($booking, 'Revised price sent. The customer will approve it before you continue.');
    }

    /** `POST /pro/bookings/{uuid}/cancel` — before arriving; counts against the professional. */
    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:500']]);
        $booking = $this->flow->cancel($this->assigned($request, $uuid), $request->user(), 'technician', $data['reason']);

        return $this->respond($booking, 'Job cancelled.');
    }

    /** `POST /pro/bookings/{uuid}/review-response` — one public reply to the customer's review. */
    public function respondToReview(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['response' => ['required', 'string', 'min:2', 'max:1000']]);
        $booking = $this->assigned($request, $uuid);
        $review = $booking->review ?? abort(404, 'This job has no review yet.');
        $this->reviews->respond($review, $data['response']);

        return $this->respond($booking, 'Reply posted.');
    }

    private function profile(Request $request): TechnicianProfile
    {
        return $request->user()->technicianProfile
            ?? abort(403, 'Set up your professional profile to see your jobs.');
    }

    private function assigned(Request $request, string $uuid): Booking
    {
        $booking = Booking::query()
            ->where('uuid', $uuid)
            ->where('technician_profile_id', $this->profile($request)->id)
            ->firstOr(fn () => abort(404, 'That job does not exist.'));

        return $this->completion->settle($booking);
    }

    private function respond(Booking $booking, string $message = 'OK'): JsonResponse
    {
        $booking->refresh()->load(self::WITH);

        return ApiResponse::success((new BookingResource($booking))->forRole('technician'), $message);
    }
}
