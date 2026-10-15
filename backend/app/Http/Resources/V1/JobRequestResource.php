<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Models\QuoteRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A marketplace request.
 *
 * The owner sees everything. A professional browsing nearby work sees the
 * job, the area and how far away it is, but never the exact address, the pin
 * or who posted it: those are revealed only once the customer accepts their
 * offer, on the booking.
 *
 * @mixin QuoteRequest
 */
class JobRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $isOwner = $viewer !== null && (int) $viewer->getKey() === (int) $this->customer_id;

        return [
            'id' => $this->uuid,
            'reference' => $this->reference,
            'state' => $this->state(),
            'accepting_bids' => $this->isAcceptingBids(),
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->uuid,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'icon' => $this->category->icon,
            ]),
            'description' => $this->description,
            'urgency' => $this->urgency,
            'city' => $this->whenLoaded('city', fn () => ['id' => $this->city->id, 'name' => $this->city->name]),
            'area' => $this->whenLoaded('area', fn () => $this->area ? ['id' => $this->area->id, 'name' => $this->area->name] : null),
            'customer_offer' => $this->customer_offer_minor === null ? null : [
                'minor' => $this->customer_offer_minor,
                'display' => 'Rs ' . number_format($this->customer_offer_minor / 100),
            ],
            'preferred_date' => $this->preferred_date?->toDateString(),
            'preferred_time_slot' => $this->preferred_time_slot,
            'quotes_count' => (int) $this->quotes_count,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'accept_until' => $this->acceptUntil()?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),

            $this->mergeWhen($isOwner, fn () => [
                'address_line' => $this->address_line,
                'landmark' => $this->landmark,
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
                'booking' => $this->booking_id === null ? null : $this->whenLoaded('booking', fn () => [
                    'id' => $this->booking->uuid,
                    'reference' => $this->booking->reference,
                    'status' => $this->booking->status->value,
                ]),
                'quotes' => QuoteResource::collection($this->whenLoaded('quotes')),
            ]),

            // Professional view only.
            $this->mergeWhen(! $isOwner, fn () => [
                'distance_km' => $this->distance_km === null ? null : round((float) $this->distance_km, 1),
                'customer_first_name' => $this->whenLoaded(
                    'customer',
                    fn () => strtok((string) $this->customer->name, ' ') ?: null
                ),
                'my_quote' => $this->when(
                    $this->resource->relationLoaded('myQuote'),
                    fn () => $this->myQuote ? new QuoteResource($this->myQuote) : null
                ),
            ]),
        ];
    }
}
