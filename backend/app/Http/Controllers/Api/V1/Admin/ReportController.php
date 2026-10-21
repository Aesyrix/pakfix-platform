<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserReport;
use App\Services\Marketplace\Safety;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The moderation queue: reports from customers and professionals about each
 * other. Store policies expect these to be handled promptly (within 24 hours).
 */
class ReportController extends Controller
{
    public function __construct(private readonly Safety $safety) {}

    /** `GET /admin/reports?status=open|reviewing|actioned|dismissed|unresolved` */
    public function index(Request $request): JsonResponse
    {
        $status = $request->validate([
            'status' => ['nullable', Rule::in([...UserReport::STATUSES, 'unresolved'])],
        ])['status'] ?? 'unresolved';

        $reports = UserReport::query()
            ->with(['reporter', 'reported.technicianProfile', 'booking', 'handler'])
            ->when($status === 'unresolved', fn ($q) => $q->unresolved(), fn ($q) => $q->where('status', $status))
            ->oldest()
            ->paginate(min($request->integer('per_page', 20), 50));

        $reports->getCollection()->transform(fn (UserReport $r) => $this->present($r));

        return ApiResponse::success($reports);
    }

    /** `PATCH /admin/reports/{uuid}` — `{ status, resolution? }` */
    public function update(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(UserReport::STATUSES)],
            'resolution' => ['nullable', 'string', 'max:2000'],
        ]);

        $report = UserReport::query()->where('uuid', $uuid)->firstOr(fn () => abort(404, 'That report does not exist.'));
        $report = $this->safety->resolve($report, $request->user(), $data['status'], $data['resolution'] ?? null);

        return ApiResponse::success(
            $this->present($report->load(['reporter', 'reported.technicianProfile', 'booking', 'handler'])),
            'Report updated.',
        );
    }

    /** @return array<string, mixed> */
    private function present(UserReport $r): array
    {
        return [
            'id' => $r->uuid,
            'reason' => $r->reason,
            'details' => $r->details,
            'snapshot' => $r->snapshot,
            'status' => $r->status,
            'resolution' => $r->resolution,
            'reporter' => $this->person($r->reporter),
            'reported' => $this->person($r->reported),
            'booking' => $r->booking === null ? null : [
                'id' => $r->booking->uuid,
                'reference' => $r->booking->reference,
                'status' => $r->booking->status->value,
            ],
            'reports_against_user' => UserReport::query()->where('reported_user_id', $r->reported_user_id)->count(),
            'handled_by' => $r->handler?->name,
            'handled_at' => $r->handled_at?->toIso8601String(),
            'created_at' => $r->created_at->toIso8601String(),
        ];
    }

    /** @return array{id: string, name: string, email: string|null, phone: string|null, role: string|null}|null */
    private function person(?User $user): ?array
    {
        if ($user === null) {
            return null;
        }

        return [
            'id' => $user->uuid,
            'name' => $user->technicianProfile?->displayName() ?? $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->primaryRole()?->value,
        ];
    }
}
