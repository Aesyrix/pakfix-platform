<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'province_id', 'name', 'slug', 'latitude', 'longitude',
        'is_served', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'is_served' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function areas(): HasMany
    {
        return $this->hasMany(Area::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Cities PakFix has actually launched in, which is what gets SEO pages. */
    public function scopeServed(Builder $query): Builder
    {
        return $query->where('is_served', true)->where('is_active', true);
    }
}
