<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * What was actually done to a property, and when. This is the permanent
 * maintenance history; it outlives schedules and tasks.
 */
class MaintenanceLog extends Model
{
    protected $fillable = [
        'property_id', 'property_asset_id', 'maintenance_task_id', 'booking_id',
        'recorded_by_user_id', 'title', 'work_performed', 'performed_on',
        'cost_minor', 'currency', 'performed_by', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'performed_on' => 'date',
            'cost_minor' => 'integer',
        ];
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
}
