<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Where a technician will travel. A null area means the whole city. */
class TechnicianServiceArea extends Model
{
    protected $fillable = [
        'technician_profile_id', 'city_id', 'area_id', 'travel_fee_minor', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'travel_fee_minor' => 'integer'];
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function coversWholeCity(): bool
    {
        return $this->area_id === null;
    }
}
