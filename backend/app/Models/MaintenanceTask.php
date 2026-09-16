<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** One dated occurrence of a maintenance schedule. */
class MaintenanceTask extends Model
{
    use HasUuid;
    use SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_NOTIFIED = 'notified';
    public const STATUS_SNOOZED = 'snoozed';
    public const STATUS_BOOKED = 'booked';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_SKIPPED = 'skipped';

    protected $fillable = [
        'maintenance_schedule_id', 'user_id', 'property_id', 'property_asset_id',
        'service_category_id', 'booking_id', 'title', 'description', 'due_on',
        'status', 'priority', 'notified_at', 'snoozed_until', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'due_on' => 'date',
            'snoozed_until' => 'date',
            'notified_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(MaintenanceSchedule::class, 'maintenance_schedule_id');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(PropertyAsset::class, 'property_asset_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_SKIPPED]);
    }

    public function scopeDue(Builder $query): Builder
    {
        return $query->open()->whereDate('due_on', '<=', now());
    }

    public function isOverdue(): bool
    {
        return $this->due_on->isPast()
            && ! in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_SKIPPED], true);
    }
}
