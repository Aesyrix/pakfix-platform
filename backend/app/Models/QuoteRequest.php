<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasReference;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * A customer asking several professionals to price the same job.
 *
 * In the marketplace this is the request nearby professionals bid on. It has
 * two clocks: `expires_at` ends the bidding window (no new bids after it), and
 * a grace period after that during which the customer can still accept a bid
 * already received. Expiry is worked out on read, so no scheduler is needed.
 */
class QuoteRequest extends Model
{
    use HasReference;
    use HasUuid;
    use SoftDeletes;

    protected string $referencePrefix = 'PFR';

    public const STATUS_OPEN = 'open';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_EXPIRED = 'expired';

    /** Shown to clients; derived from status and the two clocks. */
    public const STATE_ACCEPTING_BIDS = 'accepting_bids';
    public const STATE_CHOOSING = 'choosing';
    public const STATE_BOOKED = 'booked';
    public const STATE_CANCELLED = 'cancelled';
    public const STATE_EXPIRED = 'expired';

    protected $fillable = [
        'customer_id', 'property_id', 'service_category_id', 'booking_id',
        'ai_diagnosis_id', 'description', 'city_id', 'area_id',
        'address_line', 'landmark', 'latitude', 'longitude', 'urgency',
        'budget_min_minor', 'budget_max_minor', 'customer_offer_minor',
        'preferred_date', 'preferred_time_slot',
        'status', 'expires_at', 'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'expires_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'customer_offer_minor' => 'integer',
            'quotes_count' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_OPEN);
    }

    /** Open requests whose bidding window has not closed. */
    public function scopeAcceptingBids(Builder $query): Builder
    {
        return $query->open()
            ->whereNull('booking_id')
            ->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    /** When the customer loses the right to accept a bid already received. */
    public function acceptUntil(): ?Carbon
    {
        return $this->expires_at?->copy()->addHours((int) config('pakfix.marketplace.accept_grace_hours', 24));
    }

    public function isAcceptingBids(): bool
    {
        return $this->status === self::STATUS_OPEN
            && $this->booking_id === null
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }

    public function canAcceptQuotes(): bool
    {
        $until = $this->acceptUntil();

        return $this->status === self::STATUS_OPEN
            && $this->booking_id === null
            && ($until === null || $until->isFuture());
    }

    public function state(): string
    {
        return match (true) {
            $this->booking_id !== null => self::STATE_BOOKED,
            $this->cancelled_at !== null => self::STATE_CANCELLED,
            $this->status === self::STATUS_EXPIRED, ! $this->canAcceptQuotes() => self::STATE_EXPIRED,
            $this->isAcceptingBids() => self::STATE_ACCEPTING_BIDS,
            default => self::STATE_CHOOSING,
        };
    }

    public function biddingMinutesFor(string $urgency): int
    {
        return (int) config("pakfix.marketplace.bidding_minutes.{$urgency}", 120);
    }
}
