<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Public;

use App\Models\ContactMessage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\s()-]{7,20}$/'],
            'topic' => ['required', Rule::in(ContactMessage::TOPICS)],
            'subject' => ['required', 'string', 'min:3', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            // A field real people never see or fill in. Bots fill in everything.
            'website' => ['nullable', 'max:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.min' => 'Tell us a little more so we can help.',
            'website.max' => 'Your message could not be sent.',
        ];
    }
}
