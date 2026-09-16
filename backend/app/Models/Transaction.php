<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One movement in the ledger. Written once, never edited. */
class Transaction extends Model
{
    use HasUuid;

    public const UPDATED_AT = null;

    public const TYPE_CHARGE = 'charge';
    public const TYPE_REFUND = 'refund';
    public const TYPE_COMMISSION = 'commission';
    public const TYPE_PAYOUT = 'payout';
    public const TYPE_ADJUSTMENT = 'adjustment';
    public const TYPE_CREDIT = 'credit';

    public const DIRECTION_CREDIT = 'credit';
    public const DIRECTION_DEBIT = 'debit';

    protected $fillable = [
        'payment_id', 'booking_id', 'user_id', 'type', 'direction',
        'amount_minor', 'currency', 'description', 'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'amount_minor' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
