<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnicianPortfolioItem extends Model
{
    protected $fillable = [
        'technician_profile_id', 'service_category_id', 'title', 'description',
        'before_image_path', 'after_image_path', 'sort_order',
    ];

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }
}
