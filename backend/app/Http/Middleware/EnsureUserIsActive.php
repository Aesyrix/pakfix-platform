<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A suspended or banned account keeps its token but loses its access.
 *
 * Checking the status on every request, rather than only at sign-in, means
 * suspending someone takes effect immediately instead of whenever their token
 * happens to expire.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof User && ! $user->canAuthenticate()) {
            // Revoke the credential that got them here, so a suspended user
            // cannot keep retrying with the same token.
            $user->currentAccessToken()?->delete();

            return ApiResponse::forbidden(
                $user->status_reason
                    ?: 'This account has been suspended. Contact PakFix support.'
            );
        }

        return $next($request);
    }
}
