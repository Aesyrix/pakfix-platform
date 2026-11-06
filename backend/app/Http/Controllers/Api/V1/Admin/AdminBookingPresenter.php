<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Booking;
use App\Services\Marketplace\JobCompletion;

/**
 * How a booking looks on the admin pages. Admins see both sides, the money,
 * where the professional was, and the full timeline. Chat stays private and
 * reaches PakFix only through a report.
 */
final class AdminBookingPresenter
{
    /** @return array<string, mixed> */
    public static function row(Booking $b): array
    {
        return [
            'id' => $b->uuid,
            'reference' => $b->reference,
            'status' => $b->status->value,
            'status_label' => $b->status->label(),
            'is_finished' => $b->status->isTerminal(),
            'category' => $b->category?->name,
            'customer' => $b->customer === null ? null : ['id' => $b->customer->uuid, 'name' => $b->customer->name],
            'professional' => $b->technicianProfile === null ? null : [
                'id' => $b->technicianProfile->user?->uuid,
                'name' => $b->technicianProfile->displayName(),
            ],
            'total' => self::money($b->total_minor),
            'created_at' => $b->created_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    public static function detail(Booking $b): array
    {
        $completion = app(JobCompletion::class);

        return [
            ...self::row($b),
            'problem_description' => $b->problem_description,
            'urgency' => $b->urgency?->value,
            'address_line' => $b->address_line,
            'city' => $b->city?->name,
            'visit_fee' => self::money($b->visit_fee_minor),
            'labour' => self::money($b->labour_minor),
            'materials' => self::money($b->materials_minor),
            'payment_status' => $b->payment_status?->value,
            'completed_via' => $b->completed_via,
            'arrived_distance_m' => $b->arrived_distance_m,
            'arrived_far' => $completion->isFarFromAddress($b->arrived_distance_m),
            'completed_distance_m' => $b->completed_distance_m,
            'completed_far' => $completion->isFarFromAddress($b->completed_distance_m),
            'cancellation_reason' => $b->cancellation_reason,
            'deadlines' => $completion->deadlines($b),
            'can_cancel' => ! $b->status->isTerminal() && $b->status->value !== 'disputed',
            'dispute' => ($d = $b->disputes->sortByDesc('id')->first()) === null ? null : [
                'id' => $d->uuid,
                'reference' => $d->reference,
                'kind' => $d->kind,
                'status' => $d->status->value,
                'outcome' => $d->outcome,
            ],
            'review' => $b->review === null ? null : [
                'rating' => (int) $b->review->rating,
                'comment' => $b->review->comment,
            ],
            'timeline' => $b->statusHistory->sortBy('id')->values()->map(fn ($h) => [
                'status' => $h->to_status,
                'actor_role' => $h->actor_role,
                'note' => $h->note,
                'at' => $h->created_at?->toIso8601String(),
            ])->all(),
        ];
    }

    private static function money(?int $minor): string
    {
        return 'Rs '.number_format(((int) $minor) / 100);
    }
}
