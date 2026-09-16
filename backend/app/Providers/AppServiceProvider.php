<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureModels();
        $this->configureAuthNotificationLinks();
    }

    private function configureModels(): void
    {
        // Accessing a relation that was not eager loaded is a bug, not a
        // convenience. Failing loudly in development is how the N+1 problems
        // the brief warns about get caught before they reach production.
        Model::preventLazyLoading(! $this->app->isProduction());

        // A mass-assignment attempt against a non-fillable attribute should
        // be fixed, not silently ignored.
        Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());

        Model::unguard(false);
    }

    /**
     * PakFix has no Blade pages to land on: the backend is an API and the
     * user lives in the Next.js app. Both of Laravel's built-in auth emails
     * are therefore repointed -- verification at a signed API route that
     * redirects onward, password reset straight at the frontend form.
     */
    private function configureAuthNotificationLinks(): void
    {
        VerifyEmail::createUrlUsing(function (User $user): string {
            return URL::temporarySignedRoute(
                'api.v1.auth.verification.verify',
                now()->addMinutes((int) config('auth.verification.expire', 60)),
                [
                    'id' => $user->getKey(),
                    'hash' => sha1($user->getEmailForVerification()),
                ]
            );
        });

        ResetPassword::createUrlUsing(function (User $user, string $token): string {
            return sprintf(
                '%s/reset-password?token=%s&email=%s',
                rtrim((string) config('pakfix.frontend_url'), '/'),
                $token,
                urlencode($user->getEmailForPasswordReset())
            );
        });
    }
}
