<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\Marketplace\BookingFlow;
use App\Services\Marketplace\JobCompletion;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Every booked job on the platform, and cancelling one when PakFix must. */
class BookingController extends Controller
{
    private const DETAIL = ['category', 'city', 'customer', 'technicianProfile.user', 'statusHistory', 'disputes', 'review'];

    public function __construct(private readonly BookingFlow $flow, private readonly JobCompletion $completion) {}

    /** `GET /admin/bookings?status=active|disputed|finished|all&search=` — search by reference or name. */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::in(['active', 'disputed', 'finished', 'all'])],
            'search' => ['nullable', 'string', 'max:100'],
        ]);
        $status = $data['status'] ?? 'active';
        $search = trim((string) ($data['search'] ?? ''));
        $finished = ['customer_confirmed', 'cancelled', 'refunded'];

        $bookings = Booking::query()
            ->with(['category', 'customer', 'technicianProfile.user'])
            ->when($status === 'active', fn (Builder $q) => $q->whereNotIn('status', [...$finished, 'disputed']))
            ->when($status === 'disputed', fn (Builder $q) => $q->where('status', 'disputed'))
            ->when($status === 'finished', fn (Builder $q) => $q->whereIn('status', $finished))
            ->when($search !== '', fn (Builder $q) => $q->where(fn (Builder $w) => $w
                ->where('reference', 'like', "%{$search}%")
                ->orWhereHas('customer', fn (Builder $c) => $c->where('name', 'like', "%{$search}%"))
                ->orWhereHas('technicianProfile.user', fn (Builder $c) => $c->where('name', 'like', "%{$search}%"))))
            ->latest()
            ->paginate(min($request->integer('per_page', 25), 50));

        $bookings->getCollection()->transform(fn (Booking $b) => AdminBookingPresenter::row($b));

        return ApiResponse::success($bookings);
    }

    /** `GET /admin/bookings/{uuid}` */
    public function show(string $uuid): JsonResponse
    {
        $booking = $this->completion->settle($this->find($uuid));

        return ApiResponse::success(AdminBookingPresenter::detail($booking->load(self::DETAIL)));
    }

    /** `POST /admin/bookings/{uuid}/cancel` — `{ reason }`; nobody is charged and both sides are told. */
    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);
        $booking = $this->flow->cancelByAdmin($this->find($uuid), $request->user(), $data['reason']);

        return ApiResponse::success(AdminBookingPresenter::detail($booking->refresh()->load(self::DETAIL)), 'Job cancelled.');
    }

    private function find(string $uuid): Booking
    {
        return Booking::query()->where('uuid', $uuid)->firstOr(fn () => abort(404, 'That job does not exist.'));
    }
}
