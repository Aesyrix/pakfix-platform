<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],

            // Pakistani mobile numbers, accepted as +923xxxxxxxxx or 03xxxxxxxxx
            // and normalised to the international form before validation.
            'phone' => [
                'required', 'string', 'regex:/^\+923\d{9}$/', 'unique:users,phone',
            ],

            'password' => [
                'required', 'confirmed',
                Password::min(8)->letters()->numbers(),
            ],

            // Only customer, technician, company and property_manager can be
            // chosen here. Staff roles are granted by an admin, never claimed.
            'role' => [
                'required',
                Rule::in(array_map(
                    fn (UserRole $role) => $role->value,
                    UserRole::selfRegisterable()
                )),
            ],

            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'referral_code' => ['nullable', 'string', 'max:32', 'exists:users,referral_code'],
            'accepts_terms' => ['accepted'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $phone = preg_replace('/[\s()-]/', '', (string) $this->input('phone'));

        // 03001234567 and 923001234567 both mean +923001234567.
        if ($phone !== null && $phone !== '') {
            if (str_starts_with($phone, '03')) {
                $phone = '+92' . substr($phone, 1);
            } elseif (str_starts_with($phone, '92')) {
                $phone = '+' . $phone;
            }
        }

        $this->merge([
            'phone' => $phone,
            'email' => is_string($this->input('email'))
                ? mb_strtolower(trim($this->input('email')))
                : $this->input('email'),
        ]);
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a valid Pakistani mobile number, for example 0300 1234567.',
            'referral_code.exists' => 'That referral code does not exist.',
            'accepts_terms.accepted' => 'You need to accept the terms to create an account.',
        ];
    }

    public function role(): UserRole
    {
        return UserRole::from($this->string('role')->toString());
    }
}
