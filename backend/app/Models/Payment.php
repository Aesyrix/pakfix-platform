<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Concerns\HasReference;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * What a customer owes and what they paid. The gateway payload is kept whole
 * for reconciliation, and is never exposed through the API.
 */
class Payment extends Model
{
    use HasReference;
    use HasUuid;
    use SoftDeletes;

    protected string $referencePrefix = 'PFP';

    protected $fillable = [
        'booking_id', 'customer_id', 'method', 'gateway', 'status',
        'amount_minor', 'refunded_minor', 'currency', 'gateway_reference',
        'gateway_payload', 'failure_reason', 'paid_at', 'confirmed_by_user_id',
    ];

    protected $hidden = ['gateway_payload'];

    protected function casts(): array
    {
        return [
            'method' => PaymentMethod::class,
            'status' => PaymentStatus::class,
            'gateway_payload' => 'array',
            'paid_at' => 'datetime',
            'amount_minor' => 'integer',
            'refunded_minor' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', PaymentStatus::Paid->value);
    }

    public function refundableMinor(): int
    {
        return max(0, $this->amount_minor - $this->refunded_minor);
    }

    public function isFullyRefunded(): bool
    {
        return $this->refunded_minor >= $this->amount_minor;
    }
}
