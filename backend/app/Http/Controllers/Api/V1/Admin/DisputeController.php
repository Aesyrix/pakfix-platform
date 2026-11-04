<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\DisputeStatus;
use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\User;
use App\Services\Marketplace\JobCompletion;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Disputes on booked jobs. While one is open the job waits; the decision
 * completes or cancels it and can give the professional a strike.
 */
class DisputeController extends Controller
{
    private const WITH = ['booking.customer', 'booking.technicianProfile.user', 'booking.category', 'booking.statusHistory', 'raisedBy', 'resolvedBy'];

    public function __construct(private readonly JobCompletion $completion) {}

    /** `GET /admin/disputes?status=open|resolved` */
    public function index(Request $request): JsonResponse
    {
        $status = $request->validate(['status' => ['nullable', Rule::in(['open', 'resolved'])]])['status'] ?? 'open';

        $disputes = Dispute::query()
            ->with(self::WITH)
            ->when($status === 'open', fn ($q) => $q->open(), fn ($q) => $q->whereNotIn('status', [DisputeStatus::Open->value, DisputeStatus::UnderReview->value]))
            ->when($status === 'open', fn ($q) => $q->oldest(), fn ($q) => $q->latest('resolved_at'))
            ->paginate(min($request->integer('per_page', 20), 50));

        $disputes->getCollection()->transform(fn (Dispute $d) => $this->present($d));

        return ApiResponse::success($disputes);
    }

    /** `PATCH /admin/disputes/{uuid}` — `{ outcome: complete|cancel, strike: bool, note }` */
    public function update(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'outcome' => ['required', Rule::in(Dispute::OUTCOMES)],
            'strike' => ['boolean'],
            'note' => ['required', 'string', 'min:3', 'max:2000'],
        ], ['note.required' => 'Write a short note explaining the decision.']);

        $dispute = Dispute::query()->where('uuid', $uuid)->firstOr(fn () => abort(404, 'That dispute does not exist.'));
        $dispute = $this->completion->resolveDispute($dispute, $request->user(), $data['outcome'], (bool) ($data['strike'] ?? false), $data['note']);

        return ApiResponse::success($this->present($dispute->load(self::WITH)), 'Dispute decided.');
    }

    /** @return array<string, mixed> */
    private function present(Dispute $d): array
    {
        $b = $d->booking;
        $pro = $b?->technicianProfile;
        $money = fn (?int $minor) => 'Rs '.number_format(((int) $minor) / 100);

        return [
            'id' => $d->uuid,
            'reference' => $d->reference,
            'kind' => $d->kind,
            'raised_by_role' => $d->raised_by_role,
            'raised_by' => $this->person($d->raisedBy),
            'description' => $d->description,
            'status' => $d->status->value,
            'outcome' => $d->outcome,
            'strike_given' => $d->strike_given,
            'resolution_note' => $d->resolution_note,
            'resolved_by' => $d->resolvedBy?->name,
            'resolved_at' => $d->resolved_at?->toIso8601String(),
            'created_at' => $d->created_at->toIso8601String(),
            'booking' => $b === null ? null : [
                'id' => $b->uuid,
                'reference' => $b->reference,
                'status' => $b->status->value,
                'category' => $b->category?->name,
                'problem_description' => $b->problem_description,
                'address_line' => $b->address_line,
                'total' => $money($b->total_minor),
                'completed_via' => $b->completed_via,
                'arrived_distance_m' => $b->arrived_distance_m,
                'arrived_far' => $this->completion->isFarFromAddress($b->arrived_distance_m),
                'completed_distance_m' => $b->completed_distance_m,
                'completed_far' => $this->completion->isFarFromAddress($b->completed_distance_m),
                'customer' => $this->person($b->customer),
                'professional' => $pro === null ? null : [
                    'name' => $pro->displayName(),
                    'email' => $pro->user?->email,
                    'strikes' => (int) $pro->strikes_count,
                    'completed_jobs' => (int) $pro->completed_jobs_count,
                    'cancelled_jobs' => (int) $pro->cancelled_jobs_count,
                ],
                'timeline' => $b->statusHistory->sortBy('id')->values()->map(fn ($h) => [
                    'status' => $h->to_status,
                    'actor_role' => $h->actor_role,
                    'note' => $h->note,
                    'at' => $h->created_at?->toIso8601String(),
                ])->all(),
            ],
        ];
    }

    /** @return array<string, mixed>|null */
    private function person(?User $user): ?array
    {
        return $user === null ? null : ['name' => $user->name, 'email' => $user->email];
    }
}
