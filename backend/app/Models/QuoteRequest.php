<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasReference;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/** A customer asking several professionals to price the same job. */
class QuoteRequest extends Model
{
    use HasReference;
    use HasUuid;
    use SoftDeletes;

    protected string $referencePrefix = 'PFR';

    public const STATUS_OPEN = 'open';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'customer_id', 'property_id', 'service_category_id', 'booking_id',
        'ai_diagnosis_id', 'description', 'city_id', 'area_id', 'urgency',
        'budget_min_minor', 'budget_max_minor', 'preferred_date',
        'status', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'expires_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_OPEN);
    }
}
