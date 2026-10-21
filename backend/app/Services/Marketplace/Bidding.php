<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Enums\BookingStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\QuoteStatus;
use App\Models\Booking;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The request → bids → booking flow.
 *
 * Every money figure is computed here from its parts; nothing a client sends
 * as a total is trusted. Accepting a bid happens under a row lock on the
 * request, so two quick taps (or two devices) cannot book two professionals.
 */
class Bidding
{
    public function __construct(private readonly RequestMatcher $matcher)
    {
    }

    /** @param array<string, mixed> $data Validated input from StoreJobRequestRequest. */
    public function postRequest(User $customer, array $data): QuoteRequest
    {
        $open = QuoteRequest::query()
            ->where('customer_id', $customer->id)
            ->acceptingBids()
            ->count();

        if ($open >= (int) config('pakfix.marketplace.max_open_requests_per_customer', 5)) {
            throw ValidationException::withMessages([
                'request' => 'You already have several open requests. Choose an offer or cancel one first.',
            ]);
        }

        $category = ServiceCategory::where('uuid', $data['service_category_id'])->firstOrFail();
        $urgency = $data['urgency'] ?? 'standard';

        $request = new QuoteRequest([
            'customer_id' => $customer->id,
            'service_category_id' => $category->id,
            'description' => $data['description'],
            'city_id' => $data['city_id'],
            'area_id' => $data['area_id'] ?? null,
            'address_line' => $data['address_line'],
            'landmark' => $data['landmark'] ?? null,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'urgency' => $urgency,
            'customer_offer_minor' => $data['customer_offer_minor'] ?? null,
            'preferred_date' => $data['preferred_date'] ?? null,
            'preferred_time_slot' => $data['preferred_time_slot'] ?? null,
            'status' => QuoteRequest::STATUS_OPEN,
        ]);
        $request->expires_at = now()->addMinutes($request->biddingMinutesFor($urgency));
        $request->save();

        return $request->load(['category', 'city', 'area']);
    }

    public function cancelRequest(QuoteRequest $request): QuoteRequest
    {
        if ($request->booking_id !== null || $request->status !== QuoteRequest::STATUS_OPEN) {
            throw ValidationException::withMessages([
                'request' => 'This request can no longer be cancelled.',
            ]);
        }

        DB::transaction(function () use ($request): void {
            $request->forceFill(['status' => QuoteRequest::STATUS_CLOSED, 'cancelled_at' => now()])->save();
            $request->quotes()
                ->where('status', QuoteStatus::Sent->value)
                ->update([
                    'status' => QuoteStatus::Rejected->value,
                    'responded_at' => now(),
                    'rejection_reason' => 'The customer cancelled the request.',
                ]);
        });

        return $request->refresh();
    }

    /**
     * A professional's bid. `accept_offer` means "I'll do it for the price you
     * named", which becomes a single labour figure equal to the customer's offer.
     *
     * @param array<string, mixed> $data Validated input from StoreQuoteRequest.
     */
    public function placeQuote(TechnicianProfile $profile, QuoteRequest $request, array $data): Quote
    {
        if (! $profile->isVerified()) {
            throw ValidationException::withMessages([
                'quote' => 'Only verified professionals can send offers. Finish your verification first.',
            ]);
        }

        if (! $this->matcher->canBid($profile, $request)) {
            throw ValidationException::withMessages([
                'quote' => 'This request is no longer open to you. It may have closed or be outside your area.',
            ]);
        }

        $alreadyBid = $request->quotes()
            ->where('technician_profile_id', $profile->id)
            ->where('status', QuoteStatus::Sent->value)
            ->exists();

        if ($alreadyBid) {
            throw ValidationException::withMessages([
                'quote' => 'You have already sent an offer on this request. Withdraw it to send a new one.',
            ]);
        }

        if (! empty($data['accept_offer'])) {
            if ($request->customer_offer_minor === null) {
                throw ValidationException::withMessages([
                    'accept_offer' => 'The customer did not name a price on this request.',
                ]);
            }
            $visit = 0;
            $labour = $request->customer_offer_minor;
            $materials = 0;
        } else {
            $visit = (int) ($data['visit_fee_minor'] ?? 0);
            $labour = (int) ($data['labour_minor'] ?? 0);
            $materials = (int) ($data['materials_minor'] ?? 0);
        }

        if ($visit + $labour + $materials <= 0) {
            throw ValidationException::withMessages([
                'labour_minor' => 'Enter a price for the job.',
            ]);
        }

        return DB::transaction(function () use ($profile, $request, $data, $visit, $labour, $materials): Quote {
            $quote = new Quote([
                'quote_request_id' => $request->id,
                'technician_profile_id' => $profile->id,
                'company_id' => $profile->company_id,
                'customer_id' => $request->customer_id,
                'status' => QuoteStatus::Sent,
                'estimated_minutes' => $data['estimated_minutes'] ?? null,
                'notes' => $data['notes'] ?? null,
                'available_slots' => isset($data['arrival_minutes'])
                    ? ['arrival_minutes' => (int) $data['arrival_minutes']]
                    : null,
                'sent_at' => now(),
            ]);
            $quote->forceFill([
                'visit_fee_minor' => $visit,
                'labour_minor' => $labour,
                'materials_minor' => $materials,
                'total_minor' => $visit + $labour + $materials,
            ])->save();

            $lines = [
                ['visit_fee', 'Visit / inspection fee', $visit],
                ['labour', 'Labour', $labour],
                ['material', 'Estimated materials', $materials],
            ];
            foreach ($lines as $i => [$type, $description, $amount]) {
                if ($amount > 0) {
                    $quote->items()->create([
                        'type' => $type,
                        'description' => $description,
                        'quantity' => 1,
                        'unit_price_minor' => $amount,
                        'sort_order' => $i,
                    ]);
                }
            }

            $request->increment('quotes_count');

            return $quote->load(['technicianProfile.user', 'technicianProfile.city']);
        });
    }

    public function withdrawQuote(Quote $quote): Quote
    {
        if ($quote->status !== QuoteStatus::Sent) {
            throw ValidationException::withMessages([
                'quote' => 'Only an offer that is still waiting can be withdrawn.',
            ]);
        }

        DB::transaction(function () use ($quote): void {
            $quote->forceFill(['status' => QuoteStatus::Withdrawn, 'responded_at' => now()])->save();
            QuoteRequest::whereKey($quote->quote_request_id)->where('quotes_count', '>', 0)->decrement('quotes_count');
        });

        return $quote->refresh();
    }

    public function rejectQuote(Quote $quote, ?string $reason = null): Quote
    {
        if (! $quote->isActionable()) {
            throw ValidationException::withMessages([
                'quote' => 'This offer can no longer be declined.',
            ]);
        }

        $quote->forceFill([
            'status' => QuoteStatus::Rejected,
            'responded_at' => now(),
            'rejection_reason' => $reason,
        ])->save();

        return $quote;
    }

    /** Accepts one bid: closes the request, declines the rest, creates the booking. */
    public function acceptQuote(User $customer, Quote $quote): Booking
    {
        return DB::transaction(function () use ($customer, $quote): Booking {
            /** @var QuoteRequest $request */
            $request = QuoteRequest::whereKey($quote->quote_request_id)->lockForUpdate()->firstOrFail();
            $quote = Quote::whereKey($quote->id)->lockForUpdate()->firstOrFail();

            if (! $request->canAcceptQuotes() || ! $quote->isActionable()) {
                throw ValidationException::withMessages([
                    'quote' => 'This offer can no longer be accepted.',
                ]);
            }

            $profile = TechnicianProfile::findOrFail($quote->technician_profile_id);
            if (app(Safety::class)->blockedBetween((int) $customer->id, (int) $profile->user_id)) {
                throw ValidationException::withMessages(['quote' => 'You cannot book this professional.']);
            }
            $commission = Commission::on($quote->total_minor);

            $booking = new Booking([
                'customer_id' => $customer->id,
                'service_category_id' => $request->service_category_id,
                'technician_profile_id' => $profile->id,
                'company_id' => $quote->company_id,
                'status' => BookingStatus::Accepted,
                'urgency' => $request->urgency,
                'booking_type' => Booking::TYPE_REQUEST_QUOTES,
                'problem_description' => $request->description,
                'contact_name' => $customer->name,
                'contact_phone' => (string) $customer->phone,
                'address_line' => (string) $request->address_line,
                'city_id' => $request->city_id,
                'area_id' => $request->area_id,
                'landmark' => $request->landmark,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'preferred_date' => $request->preferred_date,
                'preferred_time_slot' => $request->preferred_time_slot,
                'payment_method' => PaymentMethod::Cash->value,
                'payment_status' => PaymentStatus::Pending,
            ]);
            $booking->forceFill([
                'labour_minor' => $quote->labour_minor,
                'materials_minor' => $quote->materials_minor,
                'visit_fee_minor' => $quote->visit_fee_minor,
                'discount_minor' => $quote->discount_minor,
                'tax_minor' => $quote->tax_minor,
                'total_minor' => $quote->total_minor,
                'commission_minor' => $commission,
                'technician_payout_minor' => $quote->total_minor - $commission,
                'assigned_at' => now(),
                'accepted_at' => now(),
            ])->save();

            $booking->statusHistory()->create([
                'from_status' => null,
                'to_status' => BookingStatus::Accepted->value,
                'changed_by_user_id' => $customer->id,
                'actor_role' => 'customer',
                'note' => "Customer accepted offer {$quote->reference}.",
                'meta' => ['quote_request' => $request->reference, 'quote' => $quote->reference],
            ]);

            $quote->forceFill([
                'status' => QuoteStatus::Accepted,
                'responded_at' => now(),
                'booking_id' => $booking->id,
            ])->save();

            $request->quotes()
                ->whereKeyNot($quote->id)
                ->where('status', QuoteStatus::Sent->value)
                ->update([
                    'status' => QuoteStatus::Rejected->value,
                    'responded_at' => now(),
                    'rejection_reason' => 'The customer chose another offer.',
                ]);

            $request->forceFill(['status' => QuoteRequest::STATUS_CLOSED, 'booking_id' => $booking->id])->save();

            return $booking;
        });
    }
}
