<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VerificationStatus;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * The professional a customer actually books. Rating and job counters are
 * denormalised here because the matcher reads them for every candidate on
 * every search; they are recalculated by events, never edited by hand.
 */
class TechnicianProfile extends Model
{
    use HasFactory;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'company_id', 'slug', 'business_name', 'bio', 'years_experience',
        'languages', 'skills', 'city_id', 'base_address', 'latitude', 'longitude',
        'service_radius_km', 'hourly_rate_minor', 'visit_fee_minor',
        'commission_percentage', 'verification_status', 'verified_at',
        'offers_emergency_service', 'is_available', 'is_accepting_jobs',
        'availability', 'onboarding_percent',
    ];

    protected function casts(): array
    {
        return [
            'languages' => 'array',
            'skills' => 'array',
            'availability' => 'array',
            'verification_status' => VerificationStatus::class,
            'verified_at' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'offers_emergency_service' => 'boolean',
            'is_available' => 'boolean',
            'is_accepting_jobs' => 'boolean',
            'rating_average' => 'float',
            'acceptance_rate' => 'float',
            'commission_percentage' => 'float',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // ---------------------------------------------------------------------
    // Relationships
    // ---------------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function verification(): HasOne
    {
        return $this->hasOne(TechnicianVerification::class)->latestOfMany();
    }

    public function services(): HasMany
    {
        return $this->hasMany(TechnicianService::class);
    }

    public function serviceAreas(): HasMany
    {
        return $this->hasMany(TechnicianServiceArea::class);
    }

    public function portfolioItems(): HasMany
    {
        return $this->hasMany(TechnicianPortfolioItem::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    // ---------------------------------------------------------------------
    // Scopes
    // ---------------------------------------------------------------------

    /** Only verified professionals are ever listed publicly. */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->where('verification_status', VerificationStatus::Verified->value);
    }

    public function scopeBookable(Builder $query): Builder
    {
        return $query->publiclyVisible()
            ->where('is_available', true)
            ->where('is_accepting_jobs', true);
    }

    public function scopeInCity(Builder $query, int $cityId): Builder
    {
        return $query->where(function (Builder $q) use ($cityId): void {
            $q->where('city_id', $cityId)
                ->orWhereHas('serviceAreas', fn (Builder $a) => $a
                    ->where('city_id', $cityId)->where('is_active', true));
        });
    }

    public function scopeForCategory(Builder $query, int $categoryId): Builder
    {
        return $query->whereHas('services', fn (Builder $s) => $s
            ->where('service_category_id', $categoryId)->where('is_active', true));
    }

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    public function isVerified(): bool
    {
        return $this->verification_status === VerificationStatus::Verified;
    }

    public function isBookable(): bool
    {
        return $this->isVerified() && $this->is_available && $this->is_accepting_jobs;
    }

    public function displayName(): string
    {
        return $this->business_name ?: (string) $this->user?->name;
    }

    /**
     * Great-circle distance in kilometres to a point, or null when either end
     * has no coordinates. Used for display; the matcher filters in SQL first.
     */
    public function distanceTo(?float $lat, ?float $lng): ?float
    {
        if ($lat === null || $lng === null || $this->latitude === null || $this->longitude === null) {
            return null;
        }

        $earthRadiusKm = 6371;
        $dLat = deg2rad($lat - $this->latitude);
        $dLng = deg2rad($lng - $this->longitude);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($this->latitude)) * cos(deg2rad($lat)) * sin($dLng / 2) ** 2;

        return round($earthRadiusKm * 2 * atan2(sqrt($a), sqrt(1 - $a)), 2);
    }
}
