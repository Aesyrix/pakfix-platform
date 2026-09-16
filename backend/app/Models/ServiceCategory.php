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
 * A node in the service tree. Top-level rows (parent_id null) are the
 * categories a customer sees on the homepage; children are subcategories, to
 * any depth an admin needs.
 */
class ServiceCategory extends Model
{
    use HasFactory;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'parent_id', 'name', 'slug', 'description', 'icon', 'image_path', 'color',
        'is_emergency', 'is_popular', 'is_active', 'sort_order',
        'typical_min_minor', 'typical_max_minor', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'is_emergency' => 'boolean',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'typical_min_minor' => 'integer',
            'typical_max_minor' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function technicianServices(): HasMany
    {
        return $this->hasMany(TechnicianService::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeTopLevel(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    public function scopePopular(Builder $query): Builder
    {
        return $query->where('is_popular', true)->where('is_active', true);
    }

    public function isTopLevel(): bool
    {
        return $this->parent_id === null;
    }

    /** The category path as a display string, e.g. "AC / HVAC > AC service". */
    public function breadcrumb(): string
    {
        return $this->parent
            ? $this->parent->breadcrumb() . ' > ' . $this->name
            : $this->name;
    }
}
