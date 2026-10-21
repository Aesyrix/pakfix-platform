<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Firebase Cloud Messaging over the HTTP v1 API, without an SDK: a service
 * account signs a short JWT, Google swaps it for an access token (cached),
 * and each message is one POST.
 *
 * The service-account file is a secret. It lives outside the repository at
 * `config('pakfix.push.credentials_path')` (written by the deploy from the
 * FIREBASE_CREDENTIALS GitHub secret) and is never logged.
 */
class Fcm
{
    public const SENT = 'sent';

    /** The token is dead (app uninstalled, token rotated): stop using it. */
    public const INVALID_TOKEN = 'invalid_token';

    public const FAILED = 'failed';

    private const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    /** @var array{project_id: string, client_email: string, private_key: string, token_uri?: string}|null */
    private ?array $credentials = null;

    public function isConfigured(): bool
    {
        try {
            $this->credentials();

            return true;
        } catch (RuntimeException) {
            return false;
        }
    }

    /**
     * @param  array<string, string>  $data  Delivered to the app with the notification (all strings).
     * @return self::SENT|self::INVALID_TOKEN|self::FAILED
     */
    public function send(string $token, string $title, string $body, array $data = []): string
    {
        $credentials = $this->credentials();

        $response = Http::withToken($this->accessToken())
            ->timeout(10)
            ->post("https://fcm.googleapis.com/v1/projects/{$credentials['project_id']}/messages:send", [
                'message' => [
                    'token' => $token,
                    'notification' => ['title' => $title, 'body' => $body],
                    'data' => array_map('strval', $data),
                    'android' => [
                        'priority' => 'high',
                        'notification' => ['channel_id' => 'pakfix_updates', 'sound' => 'default'],
                    ],
                    'apns' => [
                        'headers' => ['apns-priority' => '10'],
                        'payload' => ['aps' => ['sound' => 'default']],
                    ],
                ],
            ]);

        if ($response->successful()) {
            return self::SENT;
        }

        $status = (string) $response->json('error.status');
        $code = (string) collect($response->json('error.details', []))->pluck('errorCode')->filter()->first();
        if ($response->status() === 404 || $status === 'NOT_FOUND' || $code === 'UNREGISTERED' || $code === 'INVALID_ARGUMENT') {
            return self::INVALID_TOKEN;
        }

        Log::warning('FCM send failed', ['status' => $response->status(), 'error' => $status ?: $code]);

        return self::FAILED;
    }

    /** Whether Google accepts the service account (used by the admin status check). */
    public function canAuthenticate(): bool
    {
        try {
            return $this->accessToken() !== '';
        } catch (\Throwable) {
            return false;
        }
    }

    private function accessToken(): string
    {
        $credentials = $this->credentials();

        return Cache::remember('fcm.access_token.'.md5($credentials['client_email']), now()->addMinutes(50), function () use ($credentials): string {
            $now = time();
            $tokenUri = $credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token';
            $jwt = $this->jwt([
                'iss' => $credentials['client_email'],
                'scope' => self::SCOPE,
                'aud' => $tokenUri,
                'iat' => $now,
                'exp' => $now + 3600,
            ], $credentials['private_key']);

            $response = Http::asForm()->timeout(10)->post($tokenUri, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            $token = (string) $response->json('access_token');
            if (! $response->successful() || $token === '') {
                throw new RuntimeException('Google rejected the Firebase service account ('.$response->status().').');
            }

            return $token;
        });
    }

    /** @param array<string, int|string> $claims */
    private function jwt(array $claims, string $privateKey): string
    {
        $encode = fn (string $value): string => rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
        $unsigned = $encode((string) json_encode(['alg' => 'RS256', 'typ' => 'JWT'])).'.'.$encode((string) json_encode($claims));

        $key = openssl_pkey_get_private($privateKey);
        if ($key === false || ! openssl_sign($unsigned, $signature, $key, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('The Firebase private key could not be used.');
        }

        return $unsigned.'.'.$encode($signature);
    }

    /** @return array{project_id: string, client_email: string, private_key: string, token_uri?: string} */
    private function credentials(): array
    {
        if ($this->credentials !== null) {
            return $this->credentials;
        }

        $path = (string) config('pakfix.push.credentials_path');
        if ($path === '' || ! is_file($path)) {
            throw new RuntimeException('Push notifications are not configured.');
        }

        $json = json_decode((string) file_get_contents($path), true);
        if (! is_array($json) || empty($json['project_id']) || empty($json['client_email']) || empty($json['private_key'])) {
            throw new RuntimeException('The Firebase service account file is not valid.');
        }

        return $this->credentials = $json;
    }
}
