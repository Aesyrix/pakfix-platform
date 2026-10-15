<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Marketplace;

use Illuminate\Foundation\Http\FormRequest;

/**
 * A professional's offer on a request: visit fee, labour and estimated
 * materials in minor units, or `accept_offer` to take the customer's price.
 * The total is always computed on the server.
 */
class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $money = ['nullable', 'integer', 'min:0', 'max:500000000'];

        return [
            'accept_offer' => ['nullable', 'boolean'],
            'visit_fee_minor' => $money,
            'labour_minor' => $money,
            'materials_minor' => $money,
            // How soon the professional can be there, in minutes.
            'arrival_minutes' => ['nullable', 'integer', 'min:5', 'max:10080'],
            'estimated_minutes' => ['nullable', 'integer', 'min:5', 'max:10080'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
