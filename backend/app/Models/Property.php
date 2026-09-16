<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PropertyType;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A place a customer owns or rents. Everything PakFix remembers about a home
 * hangs off this row: its appliances, its maintenance schedule, and every job
 * ever done there.
 */
class Property extends Model
{
    use HasFactory;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'type', 'occupancy', 'address_line', 'address_line_2',
        'city_id', 'area_id', 'postal_code', 'latitude', 'longitude', 'landmark',
        'bedrooms', 'bathrooms', 'floors', 'size_value', 'size_unit', 'year_built',
        'notes', 'access_instructions', 'is_primary', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => PropertyType::class,
            'latitude' => 'float',
            'longitude' => 'float',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // A customer has exactly one primary property. Promoting one demotes
        // the rest, rather than leaving the dashboard to guess.
        static::saved(function (self $property): void {
            if ($property->is_primary && $property->wasChanged('is_primary')) {
                static::where('user_id', $property->user_id)
                    ->whereKeyNot($property->getKey())
                    ->update(['is_primary' => false]);
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(PropertyAsset::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function maintenanceSchedules(): HasMany
    {
        return $this->hasMany(MaintenanceSchedule::class);
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** The address as one line, the way it would be read out to a driver. */
    public function fullAddress(): string
    {
        return collect([
            $this->address_line,
            $this->address_line_2,
            $this->area?->name,
            $this->city?->name,
        ])->filter()->implode(', ');
    }

    public function hasCoordinates(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }
}
