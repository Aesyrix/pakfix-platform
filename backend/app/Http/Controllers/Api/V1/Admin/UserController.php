<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\User;
use App\Models\UserReport;
use App\Services\Account\AccountModeration;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Customers and professionals: find someone, see their record, suspend or
 * restore the account, and clear a professional's strikes.
 */
class UserController extends Controller
{
    public function __construct(private readonly AccountModeration $moderation) {}

    /** `GET /admin/users?search=&role=customer|technician&status=active|suspended` */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', Rule::in(['customer', 'technician'])],
            'status' => ['nullable', Rule::in(['active', 'suspended'])],
        ]);
        $search = trim((string) ($data['search'] ?? ''));

        $users = User::query()
            ->with(['roles', 'city', 'technicianProfile'])
            ->where('status', '!=', User::STATUS_DELETED)
            ->whereDoesntHave('roles', fn (Builder $r) => $r->whereIn('name', ['admin', 'super_admin', 'support_agent']))
            ->when($search !== '', fn (Builder $q) => $q->where(fn (Builder $w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")))
            ->when($data['role'] ?? null, fn (Builder $q, string $role) => $q->role($role))
            ->when(($data['status'] ?? null) === 'suspended', fn (Builder $q) => $q->whereIn('status', [User::STATUS_SUSPENDED, User::STATUS_BANNED]))
            ->when(($data['status'] ?? null) === 'active', fn (Builder $q) => $q->whereIn('status', [User::STATUS_ACTIVE, User::STATUS_PENDING]))
            ->latest()
            ->paginate(min($request->integer('per_page', 25), 50));

        $users->getCollection()->transform(fn (User $u) => $this->summary($u));

        return ApiResponse::success($users);
    }

    /** `GET /admin/users/{uuid}` — the person, their jobs, and what was reported. */
    public function show(string $uuid): JsonResponse
    {
        $user = $this->find($uuid)->load(['roles', 'city', 'technicianProfile']);
        $profileId = $user->technicianProfile?->id;

        $bookings = Booking::query()
            ->with(['category', 'customer', 'technicianProfile.user'])
            ->where(fn (Builder $q) => $q->where('customer_id', $user->id)
                ->when($profileId, fn (Builder $w) => $w->orWhere('technician_profile_id', $profileId)))
            ->latest()
            ->limit(20)
            ->get();

        $reports = UserReport::query()
            ->with('reporter')
            ->where('reported_user_id', $user->id)
            ->latest()
            ->limit(20)
            ->get();

        return ApiResponse::success([
            ...$this->summary($user),
            'status_reason' => $user->status_reason,
            'bookings' => $bookings->map(fn (Booking $b) => AdminBookingPresenter::row($b))->all(),
            'active_bookings' => $bookings->filter(fn (Booking $b) => ! $b->status->isTerminal())->count(),
            'reports' => $reports->map(fn (UserReport $r) => [
                'reason' => $r->reason,
                'details' => $r->details,
                'status' => $r->status,
                'by' => $r->reporter?->name,
                'created_at' => $r->created_at->toIso8601String(),
            ])->all(),
            'disputes_lost' => $profileId
                ? Dispute::query()->where('technician_profile_id', $profileId)->where('strike_given', true)->count()
                : 0,
        ]);
    }

    /** `POST /admin/users/{uuid}/suspend` — `{ reason }`, shown to the person when they try to sign in. */
    public function suspend(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']], [
            'reason.required' => 'Write the reason. The person sees it when they try to sign in.',
        ]);
        $user = $this->moderation->suspend($this->find($uuid), $request->user(), $data['reason']);

        return ApiResponse::success($this->summary($user->fresh(['roles', 'city', 'technicianProfile'])), 'Account suspended.');
    }

    /** `POST /admin/users/{uuid}/restore` */
    public function restore(Request $request, string $uuid): JsonResponse
    {
        $user = $this->moderation->restore($this->find($uuid), $request->user());

        return ApiResponse::success($this->summary($user->fresh(['roles', 'city', 'technicianProfile'])), 'Account restored.');
    }

    /** `POST /admin/users/{uuid}/clear-strikes` — `{ note }` */
    public function clearStrikes(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['note' => ['required', 'string', 'min:3', 'max:500']]);
        $user = $this->find($uuid);
        $profile = $user->technicianProfile ?? abort(422, 'This person is not a professional.');
        $this->moderation->clearStrikes($profile, $request->user(), $data['note']);

        return ApiResponse::success($this->summary($user->fresh(['roles', 'city', 'technicianProfile'])), 'Strikes cleared.');
    }

    private function find(string $uuid): User
    {
        return User::query()
            ->where('uuid', $uuid)
            ->where('status', '!=', User::STATUS_DELETED)
            ->firstOr(fn () => abort(404, 'That person does not exist.'));
    }

    /** @return array<string, mixed> */
    private function summary(User $u): array
    {
        $p = $u->technicianProfile;

        return [
            'id' => $u->uuid,
            'name' => $u->name,
            'email' => $u->email,
            'phone' => $u->phone,
            'role' => $u->primaryRole()?->value,
            'status' => $u->status,
            'is_suspended' => ! $u->canAuthenticate(),
            'city' => $u->city?->name,
            'joined_at' => $u->created_at?->toIso8601String(),
            'last_login_at' => $u->last_login_at?->toIso8601String(),
            'customer_bookings' => Booking::query()->where('customer_id', $u->id)->count(),
            'reports_against' => UserReport::query()->where('reported_user_id', $u->id)->count(),
            'professional' => $p === null ? null : [
                'business_name' => $p->displayName(),
                'verification' => $p->verification_status?->value,
                'strikes' => (int) $p->strikes_count,
                'max_strikes' => (int) config('pakfix.marketplace.completion.max_strikes', 3),
                'completed_jobs' => (int) $p->completed_jobs_count,
                'cancelled_jobs' => (int) $p->cancelled_jobs_count,
                'rating_average' => round((float) $p->rating_average, 1),
                'rating_count' => (int) $p->rating_count,
            ],
        ];
    }
}
