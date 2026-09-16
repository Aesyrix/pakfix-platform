<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An offer of a job to one professional. Acceptance rate and response time on
 * the technician profile are derived from these rows.
 */
class BookingInvitation extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_DECLINED = 'declined';
    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'booking_id', 'technician_profile_id', 'status', 'distance_km',
        'match_score', 'decline_reason', 'responded_at', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'distance_km' => 'float',
            'match_score' => 'float',
            'responded_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_PENDING
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }

    /** Minutes between the invitation and the response, for response-time stats. */
    public function responseMinutes(): ?int
    {
        return $this->responded_at?->diffInMinutes($this->created_at);
    }
}
