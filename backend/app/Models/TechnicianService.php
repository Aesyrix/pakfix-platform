<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A category, and optionally a specific service, that a technician offers. */
class TechnicianService extends Model
{
    protected $fillable = [
        'technician_profile_id', 'service_category_id', 'service_id',
        'price_minor', 'pricing_model', 'experience_years', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'price_minor' => 'integer'];
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
