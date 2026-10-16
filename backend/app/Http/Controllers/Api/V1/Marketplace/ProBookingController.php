<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Marketplace;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BookingResource;
use App\Models\Booking;
use App\Models\TechnicianProfile;
use App\Services\Marketplace\BookingFlow;
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
    private const WITH = ['category', 'city', 'customer', 'statusHistory', 'quotes'];

    public function __construct(private readonly BookingFlow $flow)
    {
    }

    /** `GET /pro/bookings` — active jobs first, then the rest, newest first. */
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->forTechnician($this->profile($request)->id)
            ->with(['category', 'city', 'customer', 'quotes'])
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
        ]);

        $booking = $this->flow->advance(
            $this->assigned($request, $uuid),
            $this->profile($request),
            $request->user(),
            $data['step'],
            $data['note'] ?? null,
        );

        return $this->respond($booking, 'Job updated.');
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

    private function profile(Request $request): TechnicianProfile
    {
        return $request->user()->technicianProfile
            ?? abort(403, 'Set up your professional profile to see your jobs.');
    }

    private function assigned(Request $request, string $uuid): Booking
    {
        return Booking::query()
            ->where('uuid', $uuid)
            ->where('technician_profile_id', $this->profile($request)->id)
            ->firstOr(fn () => abort(404, 'That job does not exist.'));
    }

    private function respond(Booking $booking, string $message = 'OK'): JsonResponse
    {
        $booking->refresh()->load(self::WITH);

        return ApiResponse::success((new BookingResource($booking))->forRole('technician'), $message);
    }
}
