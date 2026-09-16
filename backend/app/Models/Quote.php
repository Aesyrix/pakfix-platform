<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\QuoteStatus;
use App\Models\Concerns\HasReference;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One professional's price for one job. Totals are recomputed from the line
 * items server-side on every write, so a client cannot post its own total.
 */
class Quote extends Model
{
    use HasReference;
    use HasUuid;
    use SoftDeletes;

    protected string $referencePrefix = 'PFQ';

    protected $fillable = [
        'quote_request_id', 'booking_id', 'technician_profile_id', 'company_id',
        'customer_id', 'status', 'labour_minor', 'materials_minor', 'visit_fee_minor',
        'discount_minor', 'tax_minor', 'total_minor', 'currency', 'estimated_minutes',
        'notes', 'terms', 'available_slots', 'sent_at', 'expires_at',
        'responded_at', 'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => QuoteStatus::class,
            'available_slots' => 'array',
            'sent_at' => 'datetime',
            'expires_at' => 'datetime',
            'responded_at' => 'datetime',
            'labour_minor' => 'integer',
            'materials_minor' => 'integer',
            'visit_fee_minor' => 'integer',
            'discount_minor' => 'integer',
            'tax_minor' => 'integer',
            'total_minor' => 'integer',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class, 'quote_request_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', QuoteStatus::Sent->value)
            ->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function hasExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /** Whether the customer can still accept or reject this quote. */
    public function isActionable(): bool
    {
        return $this->status === QuoteStatus::Sent && ! $this->hasExpired();
    }
}
