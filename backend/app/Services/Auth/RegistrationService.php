<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Enums\UserRole;
use App\Models\CustomerProfile;
use App\Models\Referral;
use App\Models\TechnicianProfile;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Creating an account is more than one row: the user, their shared profile,
 * the role-specific profile, the role grant and any referral link all have to
 * land together or not at all. Controllers call this rather than assembling
 * it themselves, so registration from the web, from the mobile apps and from
 * an admin all produce identical accounts.
 */
class RegistrationService
{
    /**
     * @param  array{name:string,email:string,phone:string,password:string,city_id?:int|null,referral_code?:string|null}  $data
     */
    public function register(array $data, UserRole $role): User
    {
        return DB::transaction(function () use ($data, $role): User {
            $referrer = $this->resolveReferrer($data['referral_code'] ?? null);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => $data['password'],
                'city_id' => $data['city_id'] ?? null,
                'referred_by_user_id' => $referrer?->id,
                // Technicians and companies start pending: they can sign in
                // and complete onboarding, but they are not listed and cannot
                // be booked until an admin verifies them.
                'status' => $this->initialStatus($role),
            ]);

            $user->assignRole($role->value);

            UserProfile::create([
                'user_id' => $user->id,
                'first_name' => Str::before($data['name'], ' '),
                'last_name' => Str::contains($data['name'], ' ')
                    ? Str::after($data['name'], ' ')
                    : null,
            ]);

            $this->createRoleProfile($user, $role);

            if ($referrer) {
                $this->recordReferral($referrer, $user);
            }

            return $user->fresh(['city', 'profile']);
        });
    }

    private function initialStatus(UserRole $role): string
    {
        return in_array($role, [UserRole::Technician, UserRole::Company], true)
            ? User::STATUS_PENDING
            : User::STATUS_ACTIVE;
    }

    private function createRoleProfile(User $user, UserRole $role): void
    {
        match ($role) {
            UserRole::Customer, UserRole::PropertyManager => CustomerProfile::create([
                'user_id' => $user->id,
            ]),

            UserRole::Technician => TechnicianProfile::create([
                'user_id' => $user->id,
                'slug' => $this->uniqueTechnicianSlug($user->name),
                'city_id' => $user->city_id,
                'service_radius_km' => (int) config('pakfix.matching.default_radius_km', 15),
            ]),

            // A company owner gets their company record when they complete
            // onboarding, because it needs details we have not asked for yet.
            default => null,
        };
    }

    /** Public profile URLs are slugs, so they must not collide. */
    private function uniqueTechnicianSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'technician';
        $slug = $base;
        $suffix = 1;

        while (TechnicianProfile::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base . '-' . ++$suffix;
        }

        return $slug;
    }

    private function resolveReferrer(?string $code): ?User
    {
        return $code ? User::where('referral_code', $code)->first() : null;
    }

    /**
     * The referral is recorded as registered, not rewarded. It only qualifies
     * once the invited user completes their first booking.
     */
    private function recordReferral(User $referrer, User $invited): void
    {
        Referral::updateOrCreate(
            ['referrer_id' => $referrer->id, 'invited_user_id' => $invited->id],
            [
                'code' => (string) $referrer->referral_code,
                'invited_email' => $invited->email,
                'invited_phone' => $invited->phone,
                'status' => Referral::STATUS_REGISTERED,
                'registered_at' => now(),
            ]
        );
    }
}
