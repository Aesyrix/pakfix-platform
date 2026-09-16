<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * An appliance or installed system inside a property. Knowing the model and
 * the warranty date is what turns a vague "my AC is broken" into a useful
 * service call, and what lets PakFix warn a customer before a warranty lapses.
 */
class PropertyAsset extends Model
{
    use HasFactory;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'property_id', 'service_category_id', 'name', 'type', 'brand', 'model',
        'serial_number', 'location_in_property', 'purchase_date', 'purchase_price_minor',
        'warranty_expires_on', 'last_serviced_on', 'next_service_due_on',
        'service_interval_months', 'notes', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'warranty_expires_on' => 'date',
            'last_serviced_on' => 'date',
            'next_service_due_on' => 'date',
            'purchase_price_minor' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(PropertyAssetMedium::class);
    }

    public function maintenanceSchedules(): HasMany
    {
        return $this->hasMany(MaintenanceSchedule::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeDueForService(Builder $query): Builder
    {
        return $query->whereNotNull('next_service_due_on')
            ->whereDate('next_service_due_on', '<=', now());
    }

    public function isUnderWarranty(): bool
    {
        return $this->warranty_expires_on !== null
            && $this->warranty_expires_on->isFuture();
    }

    public function isServiceOverdue(): bool
    {
        return $this->next_service_due_on !== null
            && $this->next_service_due_on->isPast();
    }

    /**
     * Rolls the service dates forward after a service is recorded. Returns
     * the new due date, or null when the asset has no recurring interval.
     */
    public function recordServiced(?\DateTimeInterface $on = null): ?\Carbon\CarbonInterface
    {
        $servicedOn = \Illuminate\Support\Carbon::instance($on ? \Carbon\Carbon::instance($on) : now());

        $this->last_serviced_on = $servicedOn;
        $this->next_service_due_on = $this->service_interval_months
            ? $servicedOn->copy()->addMonths($this->service_interval_months)
            : null;
        $this->save();

        return $this->next_service_due_on;
    }
}
