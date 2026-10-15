<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Marketplace;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** A customer posting a job for nearby professionals to bid on. */
class StoreJobRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_category_id' => [
                'required', 'string',
                Rule::exists('service_categories', 'uuid')->where('is_active', true),
            ],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'address_line' => ['required', 'string', 'min:5', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],

            // Pakistan's bounding box, so a mistyped or default (0,0) pin is caught.
            'latitude' => ['required', 'numeric', 'between:23.5,37.5'],
            'longitude' => ['required', 'numeric', 'between:60.5,77.9'],

            'urgency' => ['nullable', Rule::in(['flexible', 'standard', 'urgent', 'emergency'])],
            // Minor units. Rs 200 floor, Rs 5,000,000 ceiling.
            'customer_offer_minor' => ['nullable', 'integer', 'min:20000', 'max:500000000'],
            'preferred_date' => ['nullable', 'date', 'after_or_equal:today'],
            'preferred_time_slot' => ['nullable', 'string', 'max:32'],
        ];
    }

    public function messages(): array
    {
        return [
            'service_category_id.required' => 'Choose the service you need.',
            'service_category_id.exists' => 'That service is not available.',
            'description.min' => 'Describe the problem in a little more detail, so professionals can price it.',
            'address_line.required' => 'Enter the address where the work is needed.',
            'latitude.required' => 'Set the job location on the map.',
            'latitude.between' => 'The job location must be in Pakistan.',
            'longitude.between' => 'The job location must be in Pakistan.',
            'customer_offer_minor.min' => 'Your offer must be at least Rs 200.',
        ];
    }
}
