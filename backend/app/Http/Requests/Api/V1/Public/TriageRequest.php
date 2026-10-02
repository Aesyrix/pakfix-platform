<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Public;

use Illuminate\Foundation\Http\FormRequest;

class TriageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'min:3', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'Tell us what is wrong, in a few words.',
            'description.min' => 'Tell us a little more about the problem.',
        ];
    }
}
