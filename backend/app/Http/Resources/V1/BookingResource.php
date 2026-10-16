<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Enums\QuoteStatus;
use App\Models\Booking;
use App\Services\Marketplace\BookingFlow;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * A booking as one side of it sees it.
 *
 * Both sides see the job, the address (the professional has been chosen, so
 * they need it), the money and the timeline. The customer sees the
 * professional's card; the professional sees the customer's first name.
 * Phone numbers are never included: contact goes through the app.
 *
 * Pass the viewer's role with `->additional(['role' => 'customer'|'technician'])`
 * or set it via {@see forRole()}.
 *
 * @mixin Booking
 */
class BookingResource extends JsonResource
{
    private string $role = 'customer';

    public function forRole(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function toArray(Request $request): array
    {
        $money = fn (?int $minor) => ['minor' => (int) $minor, 'display' => 'Rs ' . number_format(((int) $minor) / 100)];
        $isPro = $this->role === 'technician';

        return [
            'id' => $this->uuid,
            'reference' => $this->reference,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'is_active' => $this->status->isActive(),
            'actions' => app(BookingFlow::class)->actionsFor($this->resource, $this->role),
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->uuid,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'icon' => $this->category->icon,
            ]),
            'problem_description' => $this->problem_description,
            'urgency' => $this->urgency?->value,
            'preferred_date' => $this->preferred_date?->toDateString(),
            'preferred_time_slot' => $this->preferred_time_slot,
            'address_line' => $this->address_line,
            'landmark' => $this->landmark,
            'city' => $this->whenLoaded('city', fn () => ['id' => $this->city->id, 'name' => $this->city->name]),
            'latitude' => $this->latitude === null ? null : (float) $this->latitude,
            'longitude' => $this->longitude === null ? null : (float) $this->longitude,
            'visit_fee' => $money($this->visit_fee_minor),
            'labour' => $money($this->labour_minor),
            'materials' => $money($this->materials_minor),
            'total' => $money($this->total_minor),
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status?->value,
            'cancellation_reason' => $this->cancellation_reason,
            'times' => [
                'accepted_at' => $this->accepted_at?->toIso8601String(),
                'on_way_at' => $this->on_way_at?->toIso8601String(),
                'arrived_at' => $this->arrived_at?->toIso8601String(),
                'started_at' => $this->started_at?->toIso8601String(),
                'completed_at' => $this->completed_at?->toIso8601String(),
                'confirmed_at' => $this->confirmed_at?->toIso8601String(),
                'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            ],
            'created_at' => $this->created_at?->toIso8601String(),

            'timeline' => $this->whenLoaded('statusHistory', fn () => $this->statusHistory
                ->sortBy('id')
                ->values()
                ->map(fn ($h) => [
                    'status' => $h->to_status,
                    'actor_role' => $h->actor_role,
                    'note' => $h->note,
                    'at' => $h->created_at?->toIso8601String(),
                ])
                ->all()),

            'pending_quote' => $this->whenLoaded('quotes', function () use ($money) {
                $q = $this->quotes
                    ->filter(fn ($q) => $q->status === QuoteStatus::Sent && $q->quote_request_id === null)
                    ->sortByDesc('id')
                    ->first();

                return $q === null ? null : [
                    'id' => $q->uuid,
                    'reference' => $q->reference,
                    'visit_fee' => $money($q->visit_fee_minor),
                    'labour' => $money($q->labour_minor),
                    'materials' => $money($q->materials_minor),
                    'total' => $money($q->total_minor),
                    'notes' => $q->notes,
                    'sent_at' => $q->sent_at?->toIso8601String(),
                ];
            }),

            $this->mergeWhen(! $isPro, fn () => [
                'professional' => $this->whenLoaded('technicianProfile', function () {
                    $p = $this->technicianProfile;
                    if ($p === null) {
                        return null;
                    }
                    $avatar = $p->relationLoaded('user') ? $p->user?->avatar_path : null;

                    return [
                        'id' => $p->uuid,
                        'name' => $p->displayName(),
                        'avatar_url' => $avatar ? Storage::url($avatar) : null,
                        'is_verified' => $p->isVerified(),
                        'rating_average' => round((float) $p->rating_average, 1),
                        'rating_count' => (int) $p->rating_count,
                        'completed_jobs_count' => (int) $p->completed_jobs_count,
                    ];
                }),
            ]),

            $this->mergeWhen($isPro, fn () => [
                'customer_first_name' => $this->whenLoaded(
                    'customer',
                    fn () => strtok((string) $this->customer->name, ' ') ?: null
                ),
            ]),
        ];
    }
}
