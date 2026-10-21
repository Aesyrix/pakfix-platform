<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserRole;
use App\Models\Concerns\HasUuid;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * One users table for every role. What distinguishes a customer from a
 * technician is the role assignment plus which profile row they own, not a
 * separate table per kind of person -- that keeps authentication, messaging
 * and notifications from needing a branch for each role.
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    use HasFactory;
    use HasRoles;
    use HasUuid;
    use Notifiable;
    use SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_PENDING = 'pending';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_BANNED = 'banned';

    /** Deleted by the person themselves; personal details have been erased. */
    public const STATUS_DELETED = 'deleted';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'avatar_path',
        'locale',
        'status',
        'status_reason',
        'city_id',
        'referral_code',
        'referred_by_user_id',
        'onboarding_completed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'onboarding_completed_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $user): void {
            $user->referral_code ??= self::generateReferralCode($user->name);
        });
    }

    /**
     * A short, shareable code such as PAKFIX-RAUF25. Collisions are retried
     * rather than tolerated, because the code is a public identifier.
     */
    public static function generateReferralCode(?string $name): string
    {
        $stem = Str::upper(Str::substr(Str::slug((string) $name, ''), 0, 6)) ?: 'USER';

        do {
            $code = sprintf('PAKFIX-%s%d', $stem, random_int(10, 99));
        } while (self::where('referral_code', $code)->exists());

        return $code;
    }

    // ---------------------------------------------------------------------
    // Relationships
    // ---------------------------------------------------------------------

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function customerProfile(): HasOne
    {
        return $this->hasOne(CustomerProfile::class);
    }

    public function technicianProfile(): HasOne
    {
        return $this->hasOne(TechnicianProfile::class);
    }

    public function ownedCompany(): HasOne
    {
        return $this->hasOne(Company::class, 'owner_user_id');
    }

    public function companyMemberships(): HasMany
    {
        return $this->hasMany(CompanyMember::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(self::class, 'referred_by_user_id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /** Suspended and banned accounts keep their data but cannot sign in. */
    public function canAuthenticate(): bool
    {
        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_PENDING], true);
    }

    public function primaryRole(): ?UserRole
    {
        $name = $this->getRoleNames()->first();

        return $name ? UserRole::tryFrom($name) : null;
    }

    public function isStaff(): bool
    {
        return (bool) $this->primaryRole()?->isStaff();
    }

    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null;
    }

    public function markLogin(?string $ip): void
    {
        $this->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ])->saveQuietly();
    }
}
