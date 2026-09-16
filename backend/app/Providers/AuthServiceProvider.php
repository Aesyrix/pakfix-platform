<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Authorisation wiring.
 *
 * The super admin is granted everything here rather than by holding every
 * permission row. That way a permission added next month is covered
 * automatically, instead of silently excluding the one account that is
 * supposed to be able to fix things.
 */
class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::before(function (User $user, string $ability): ?bool {
            // Returning null rather than false lets the normal policy and
            // permission checks run for everyone else.
            return $user->hasRole(UserRole::SuperAdmin->value) ? true : null;
        });
    }
}
