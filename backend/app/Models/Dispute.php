<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\DisputeStatus;
use App\Models\Concerns\HasReference;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * A disagreement about a booked job, decided by PakFix.
 *
 * While a dispute is open the job waits: nothing completes or confirms on its
 * own. The decision sends the job to "completed" or "cancelled", and may give
 * the professional a strike.
 *
 * @property int $id
 * @property string $uuid
 * @property string $reference
 * @property int $booking_id
 * @property string $kind
 * @property string|null $raised_by_role
 * @property string $description
 * @property DisputeStatus $status
 * @property string|null $outcome
 * @property bool $strike_given
 * @property string|null $resolution_note
 * @property Carbon|null $resolved_at
 * @property Carbon $created_at
 */
class Dispute extends Model
{
    use HasReference;
    use HasUuid;
    use SoftDeletes;

    /** not_done: the customer said a job is done that the professional says they never did. */
    public const KINDS = ['problem', 'no_show', 'not_paid', 'not_done'];

    public const OUTCOMES = ['complete', 'cancel'];

    protected string $referencePrefix = 'PFD';

    protected $fillable = [
        'booking_id', 'raised_by_user_id', 'technician_profile_id', 'kind', 'raised_by_role',
        'description', 'status', 'outcome', 'strike_given', 'resolution_note', 'resolved_by_user_id', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => DisputeStatus::class,
            'strike_given' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function raisedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'raised_by_user_id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_user_id');
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function isOpen(): bool
    {
        return in_array($this->status, [DisputeStatus::Open, DisputeStatus::UnderReview], true);
    }

    /** @param Builder<Dispute> $query */
    public function scopeOpen(Builder $query): void
    {
        $query->whereIn('status', [DisputeStatus::Open->value, DisputeStatus::UnderReview->value]);
    }
}
