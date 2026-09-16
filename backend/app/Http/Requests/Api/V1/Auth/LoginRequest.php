<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Sign in with either an email address or a phone number in the same field,
 * because that is how people actually remember their account.
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            // Names the token so a user can recognise and revoke a device.
            'device_name' => ['nullable', 'string', 'max:120'],
            'remember' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $login = trim((string) $this->input('login'));

        if ($login !== '' && ! str_contains($login, '@')) {
            $login = preg_replace('/[\s()-]/', '', $login);

            if (str_starts_with($login, '03')) {
                $login = '+92' . substr($login, 1);
            } elseif (str_starts_with($login, '92')) {
                $login = '+' . $login;
            }
        } else {
            $login = mb_strtolower($login);
        }

        $this->merge(['login' => $login]);
    }

    /** Which column this login value should be matched against. */
    public function identifierField(): string
    {
        return str_contains($this->string('login')->toString(), '@') ? 'email' : 'phone';
    }

    public function deviceName(): string
    {
        return $this->string('device_name')->toString()
            ?: substr((string) $this->userAgent(), 0, 120)
            ?: 'Unknown device';
    }
}
