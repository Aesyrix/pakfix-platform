<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Services\Notifications\Fcm;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

/**
 * The app registers its Firebase token after sign-in and removes it on sign
 * out, so notifications reach the phone of whoever is signed in on it.
 */
class PushTokenController extends Controller
{
    /** `POST /push-tokens` — `{ token, platform: android|ios, device_name?, app_version? }` */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:512'],
            'platform' => ['required', Rule::in(['android', 'ios'])],
            'device_name' => ['nullable', 'string', 'max:120'],
            'app_version' => ['nullable', 'string', 'max:32'],
        ]);
        $user = $request->user();

        // A phone belongs to whoever signed in on it last.
        DeviceToken::query()->where('token', $data['token'])->where('user_id', '!=', $user->id)->delete();

        DeviceToken::query()->updateOrCreate(
            ['user_id' => $user->id, 'token' => $data['token']],
            [
                'platform' => $data['platform'],
                'device_name' => $data['device_name'] ?? null,
                'app_version' => $data['app_version'] ?? null,
                'last_used_at' => now(),
                'is_active' => true,
            ],
        );

        return ApiResponse::success(null, 'Notifications are on for this phone.');
    }

    /** `DELETE /push-tokens` — `{ token }` (on sign out). */
    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate(['token' => ['required', 'string', 'max:512']]);
        DeviceToken::query()->where('user_id', $request->user()->id)->where('token', $data['token'])->delete();

        return ApiResponse::success(null, 'Notifications are off for this phone.');
    }

    /**
     * `ready`, `not_configured` or `rejected`: whether this server can send
     * notifications. Public on purpose (it reveals nothing else), so a deploy
     * can be checked without signing in. Cached for ten minutes.
     */
    public static function status(Fcm $fcm): string
    {
        return Cache::remember('push.status', now()->addMinutes(10), function () use ($fcm): string {
            if (! config('pakfix.push.enabled') || ! $fcm->isConfigured()) {
                return 'not_configured';
            }

            return $fcm->canAuthenticate() ? 'ready' : 'rejected';
        });
    }
}
