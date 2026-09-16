<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/** The recurring rule behind a maintenance reminder. */
class MaintenanceSchedule extends Model
{
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'property_id', 'property_asset_id', 'service_category_id',
        'title', 'description', 'interval_months', 'starts_on', 'ends_on',
        'next_due_on', 'reminder_days_before', 'is_active', 'is_system_generated',
    ];

    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
            'next_due_on' => 'date',
            'is_active' => 'boolean',
            'is_system_generated' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(PropertyAsset::class, 'property_asset_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(MaintenanceTask::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Schedules whose next occurrence should be materialised into a task. */
    public function scopeDueForGeneration(Builder $query): Builder
    {
        return $query->active()->whereDate('next_due_on', '<=', now()->addDays(30));
    }

    /** Moves the rule on to its next occurrence, respecting any end date. */
    public function advance(): ?Carbon
    {
        $next = $this->next_due_on->copy()->addMonths($this->interval_months);

        if ($this->ends_on && $next->greaterThan($this->ends_on)) {
            $this->forceFill(['is_active' => false])->save();

            return null;
        }

        $this->forceFill(['next_due_on' => $next])->save();

        return $next;
    }
}
