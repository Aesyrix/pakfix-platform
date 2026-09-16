<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A bookable item inside a category, such as "AC general service".
 * A category without services is still bookable; the customer just describes
 * the problem and the professional quotes for it.
 */
class Service extends Model
{
    use HasFactory;
    use HasUuid;
    use SoftDeletes;

    public const PRICING_FIXED = 'fixed';
    public const PRICING_HOURLY = 'hourly';
    public const PRICING_QUOTE_ONLY = 'quote_only';
    public const PRICING_VISIT_FEE = 'visit_fee';

    protected $fillable = [
        'service_category_id', 'name', 'slug', 'description', 'inclusions', 'exclusions',
        'pricing_model', 'base_price_minor', 'visit_fee_minor', 'estimated_minutes',
        'is_emergency', 'is_active', 'sort_order', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'is_emergency' => 'boolean',
            'is_active' => 'boolean',
            'base_price_minor' => 'integer',
            'visit_fee_minor' => 'integer',
            'estimated_minutes' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Whether a price can be shown up front, or only after an inspection. */
    public function hasUpfrontPrice(): bool
    {
        return $this->pricing_model !== self::PRICING_QUOTE_ONLY
            && $this->base_price_minor !== null;
    }
}
