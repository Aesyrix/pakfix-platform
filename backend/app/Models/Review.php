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
 * A rating tied to a completed booking. The unique index on booking_id is
 * what keeps a professional from being reviewed twice for one job.
 */
class Review extends Model
{
    use HasFactory;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'booking_id', 'customer_id', 'technician_profile_id', 'company_id',
        'rating', 'quality_rating', 'professionalism_rating', 'communication_rating',
        'value_rating', 'timeliness_rating', 'comment', 'is_verified',
        'is_published', 'would_recommend', 'response', 'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'is_published' => 'boolean',
            'would_recommend' => 'boolean',
            'responded_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ReviewMedium::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /** The mean of whichever detailed scores were given, for display. */
    public function detailAverage(): ?float
    {
        $scores = array_filter([
            $this->quality_rating,
            $this->professionalism_rating,
            $this->communication_rating,
            $this->value_rating,
            $this->timeliness_rating,
        ], fn ($v) => $v !== null);

        return $scores === [] ? null : round(array_sum($scores) / count($scores), 2);
    }
}
