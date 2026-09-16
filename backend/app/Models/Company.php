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
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'owner_user_id', 'name', 'slug', 'legal_name', 'registration_number', 'ntn',
        'description', 'logo_path', 'website', 'contact_email', 'contact_phone',
        'city_id', 'address_line', 'latitude', 'longitude', 'verification_status',
        'verified_at', 'year_founded', 'team_size', 'commission_percentage', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'verification_status' => VerificationStatus::class,
            'verified_at' => 'datetime',
            'is_active' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'rating_average' => 'float',
            'commission_percentage' => 'float',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(CompanyMember::class);
    }

    public function technicians(): HasMany
    {
        return $this->hasMany(TechnicianProfile::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('verification_status', VerificationStatus::Verified->value)
            ->where('is_active', true);
    }

    public function isVerified(): bool
    {
        return $this->verification_status === VerificationStatus::Verified;
    }
}
