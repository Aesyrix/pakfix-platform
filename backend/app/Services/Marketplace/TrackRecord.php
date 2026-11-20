<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\CustomerRating;
use App\Models\Dispute;
use App\Models\TechnicianProfile;
use App\Models\User;
use App\Models\UserReport;
use Illuminate\Support\Carbon;

/**
 * How someone has behaved on PakFix, so the other side can decide with
 * open eyes: pros see a customer's record before sending an offer, and
 * customers see a pro's record before accepting one. Admins see more
 * (strikes, reports, disputes).
 *
 * Flags are plain facts with a threshold, never a judgement by a person:
 *  - new: no finished jobs yet
 *  - often_cancels: 2+ cancellations and at least 30% of their jobs cancelled
 *  - low_rated: an average under 3 stars from 3+ ratings
 *  - top_rated: 4.7 stars or more from 5+ ratings
 */
class TrackRecord
{
    public const FINISHED = [BookingStatus::Completed, BookingStatus::CustomerConfirmed];

    /**
     * A customer's record, as professionals see it.
     *
     * @return array{member_since: string|null, jobs_done: int, cancellations: int, rating_average: float|null, rating_count: int, flags: list<string>}
     */
    public function forCustomer(User $customer): array
    {
        return $this->forCustomers([$customer->id])[$customer->id] ?? $this->customerRecord($customer->created_at?->toDateString(), 0, 0, null, 0);
    }

    /**
     * Several customers' records with a handful of grouped queries (for a list of jobs).
     *
     * @param  list<int>  $ids
     * @return array<int, array{member_since: string|null, jobs_done: int, cancellations: int, rating_average: float|null, rating_count: int, flags: list<string>}>
     */
    public function forCustomers(array $ids): array
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));
        if ($ids === []) {
            return [];
        }

        $since = User::whereIn('id', $ids)->pluck('created_at', 'id');
        $done = Booking::whereIn('customer_id', $ids)
            ->whereIn('status', array_map(fn ($s) => $s->value, self::FINISHED))
            ->selectRaw('customer_id, count(*) as total')->groupBy('customer_id')->pluck('total', 'customer_id');
        // Only cancellations the customer made themselves count against them.
        $cancelled = Booking::whereIn('customer_id', $ids)
            ->where('status', BookingStatus::Cancelled->value)
            ->whereColumn('cancelled_by_user_id', 'customer_id')
            ->selectRaw('customer_id, count(*) as total')->groupBy('customer_id')->pluck('total', 'customer_id');
        $ratings = CustomerRating::whereIn('customer_id', $ids)
            ->selectRaw('customer_id, count(*) as total, avg(rating) as average')->groupBy('customer_id')->get()->keyBy('customer_id');

        $records = [];
        foreach ($ids as $id) {
            if (! $since->has($id)) {
                continue;
            }
            $count = (int) ($ratings[$id]->total ?? 0);
            $records[$id] = $this->customerRecord(
                $since[$id] ? Carbon::parse($since[$id])->toDateString() : null,
                (int) ($done[$id] ?? 0),
                (int) ($cancelled[$id] ?? 0),
                $count > 0 ? round((float) $ratings[$id]->average, 1) : null,
                $count,
            );
        }

        return $records;
    }

    /**
     * A professional's record, as customers see it.
     *
     * @return array{member_since: string|null, jobs_done: int, cancellations: int, rating_average: float|null, rating_count: int, flags: list<string>}
     */
    public function forPro(TechnicianProfile $pro): array
    {
        $done = (int) $pro->completed_jobs_count;
        $cancelled = (int) $pro->cancelled_jobs_count;
        $count = (int) $pro->rating_count;
        $average = $count > 0 ? round((float) $pro->rating_average, 1) : null;

        return [
            'member_since' => $pro->created_at?->toDateString(),
            'jobs_done' => $done,
            'cancellations' => $cancelled,
            'rating_average' => $average,
            'rating_count' => $count,
            'flags' => $this->flags($done, $cancelled, $average, $count),
        ];
    }

    /**
     * Everything PakFix staff need: both sides of a person's record, plus
     * strikes, reports and disputes.
     *
     * @return array<string, mixed>
     */
    public function forAdmin(User $user): array
    {
        $pro = $user->technicianProfile;

        return [
            'as_customer' => $this->forCustomer($user),
            'as_pro' => $pro ? $this->forPro($pro) + ['strikes' => (int) $pro->strikes_count] : null,
            'reports_against' => UserReport::where('reported_user_id', $user->id)->count(),
            'reports_open' => UserReport::where('reported_user_id', $user->id)->where('status', 'open')->count(),
            'disputes' => Dispute::query()
                ->where(fn ($q) => $q->where('raised_by_user_id', $user->id)
                    ->orWhereHas('booking', fn ($b) => $b->where('customer_id', $user->id))
                    ->when($pro, fn ($q) => $q->orWhere('technician_profile_id', $pro->id)))
                ->count(),
            // Private notes pros left about this customer, newest first.
            'pro_notes' => CustomerRating::where('customer_id', $user->id)
                ->whereNotNull('note')
                ->latest()
                ->limit(10)
                ->get(['rating', 'note', 'created_at'])
                ->map(fn (CustomerRating $r) => ['rating' => $r->rating, 'note' => $r->note, 'at' => $r->created_at?->toIso8601String()])
                ->all(),
        ];
    }

    /** @return array{member_since: string|null, jobs_done: int, cancellations: int, rating_average: float|null, rating_count: int, flags: list<string>} */
    private function customerRecord(?string $since, int $done, int $cancelled, ?float $average, int $count): array
    {
        return [
            'member_since' => $since,
            'jobs_done' => $done,
            'cancellations' => $cancelled,
            'rating_average' => $average,
            'rating_count' => $count,
            'flags' => $this->flags($done, $cancelled, $average, $count),
        ];
    }

    /** @return list<string> */
    private function flags(int $done, int $cancelled, ?float $average, int $count): array
    {
        $flags = [];
        if ($done === 0) {
            $flags[] = 'new';
        }
        if ($cancelled >= 2 && $cancelled / max(1, $done + $cancelled) >= 0.3) {
            $flags[] = 'often_cancels';
        }
        if ($average !== null && $count >= 3 && $average < 3) {
            $flags[] = 'low_rated';
        }
        if ($average !== null && $count >= 5 && $average >= 4.7) {
            $flags[] = 'top_rated';
        }

        return $flags;
    }
}
