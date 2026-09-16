<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Email verification for a headless backend.
 *
 * The link in the email is a signed URL on the API. Following it verifies the
 * address and then bounces the browser to the Next.js app, so the person ends
 * up looking at PakFix rather than at a JSON document.
 */
class EmailVerificationController extends Controller
{
    /** Signed link target. Not authenticated: the signature is the proof. */
    public function verify(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = User::find($id);

        // A tampered id or a hash that does not match the current address.
        if (! $user || ! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect($this->frontend('/verify-email?status=invalid'));
        }

        if ($user->hasVerifiedEmail()) {
            return redirect($this->frontend('/verify-email?status=already-verified'));
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return redirect($this->frontend('/verify-email?status=verified'));
    }

    /** Sends the link again, for the "didn't get it" button. */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::success(null, 'Your email is already verified.');
        }

        $user->sendEmailVerificationNotification();

        return ApiResponse::success(null, 'Verification email sent.');
    }

    public function status(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'email_verified' => $request->user()->hasVerifiedEmail(),
            'phone_verified' => $request->user()->phone_verified_at !== null,
        ]);
    }

    private function frontend(string $path): string
    {
        return rtrim((string) config('pakfix.frontend_url'), '/') . $path;
    }
}
