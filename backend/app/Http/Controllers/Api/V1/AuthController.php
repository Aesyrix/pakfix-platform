<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Services\Auth\RegistrationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Registration, sign-in and session management for every client.
 *
 * The web app and the future mobile apps use the same endpoints, but not the
 * same credential:
 *
 *  - A request from the PakFix frontend arrives stateful (Sanctum recognises
 *    the origin), so it gets a session cookie. No token is minted and nothing
 *    sensitive is handed to JavaScript, which is what makes an XSS bug on the
 *    site much less valuable to an attacker.
 *  - A request from a native app, or any client without a session, gets a
 *    bearer token instead.
 *
 * `token` in the response is therefore null for the browser and a string for
 * the mobile apps. Business rules live here once either way.
 */
class AuthController extends Controller
{
    public function __construct(private readonly RegistrationService $registration)
    {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->registration->register(
            $request->safe()->only(['name', 'email', 'phone', 'password', 'city_id', 'referral_code']),
            $request->role()
        );

        event(new \Illuminate\Auth\Events\Registered($user));

        $token = $this->establishSession($request, $user, 'registration');

        return ApiResponse::created(
            [
                'user' => (new UserResource($user))->resolve($request),
                'token' => $token,
            ],
            'Welcome to PakFix. Your account is ready.'
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $this->assertNotRateLimited($request);

        $user = User::where($request->identifierField(), $request->string('login')->toString())->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            RateLimiter::hit($this->throttleKey($request));

            // Deliberately identical whether the account exists or not, so
            // this endpoint cannot be used to enumerate users.
            throw ValidationException::withMessages([
                'login' => 'Those credentials do not match our records.',
            ]);
        }

        if (! $user->canAuthenticate()) {
            return ApiResponse::forbidden(
                $user->status_reason ?: 'This account has been suspended. Contact PakFix support.'
            );
        }

        RateLimiter::clear($this->throttleKey($request));
        $user->markLogin($request->ip());

        $token = $this->establishSession($request, $user, $request->deviceName());

        return ApiResponse::success(
            [
                'user' => (new UserResource($user->load(['city', 'profile'])))->resolve($request),
                'token' => $token,
            ],
            'Signed in.'
        );
    }

    /** The authenticated user, used by the frontend on every page load. */
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            new UserResource($request->user()->load(['city', 'profile']))
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        // A cookie session has no personal access token to revoke; it is the
        // session itself that has to be torn down.
        if ($token instanceof \Laravel\Sanctum\PersonalAccessToken) {
            $token->delete();
        }

        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return ApiResponse::success(null, 'Signed out.');
    }

    /** Revokes every token, for "sign out on all devices". */
    public function logoutAll(Request $request): JsonResponse
    {
        $count = $request->user()->tokens()->count();
        $request->user()->tokens()->delete();

        return ApiResponse::success(
            ['revoked' => $count],
            'Signed out of all devices.'
        );
    }

    /** The devices currently holding a token, so a user can audit them. */
    public function devices(Request $request): JsonResponse
    {
        $current = $request->user()->currentAccessToken();

        $devices = $request->user()->tokens()
            ->latest('last_used_at')
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'created_at' => $token->created_at?->toIso8601String(),
                'is_current' => $current !== null && $token->id === $current->id,
            ]);

        return ApiResponse::success($devices);
    }

    public function revokeDevice(Request $request, int $tokenId): JsonResponse
    {
        $deleted = $request->user()->tokens()->whereKey($tokenId)->delete();

        return $deleted
            ? ApiResponse::success(null, 'Device signed out.')
            : ApiResponse::notFound('That device is not signed in.');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::sendResetLink($request->only('email'));

        // Always the same answer, so this cannot confirm who has an account.
        return ApiResponse::success(
            null,
            'If that email belongs to a PakFix account, a reset link is on its way.'
        );
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(8)->letters()->numbers()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill(['password' => $password])->save();
                // A password reset invalidates every existing session.
                $user->tokens()->delete();
            }
        );

        return $status === Password::PasswordReset
            ? ApiResponse::success(null, 'Password updated. Sign in with your new password.')
            : ApiResponse::error('That reset link is invalid or has expired.', 400);
    }

    // -----------------------------------------------------------------
    // Credentials
    // -----------------------------------------------------------------

    /**
     * Signs the user in and returns the credential the caller needs.
     *
     * A stateful request (the PakFix frontend) gets a regenerated session
     * cookie and no token. Everything else gets a personal access token.
     * Regenerating the session id on sign-in is what prevents session fixation.
     */
    private function establishSession(Request $request, User $user, string $tokenName): ?string
    {
        if ($request->hasSession()) {
            Auth::guard('web')->login($user);
            $request->session()->regenerate();

            return null;
        }

        return $user->createToken($tokenName)->plainTextToken;
    }

    // -----------------------------------------------------------------
    // Throttling
    // -----------------------------------------------------------------

    private function assertNotRateLimited(LoginRequest $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'login' => sprintf('Too many attempts. Try again in %d seconds.', $seconds),
        ]);
    }

    /** Keyed on the identifier and the IP, so one attacker cannot lock out a user. */
    private function throttleKey(LoginRequest $request): string
    {
        return 'login:' . sha1($request->string('login')->toString() . '|' . $request->ip());
    }
}
