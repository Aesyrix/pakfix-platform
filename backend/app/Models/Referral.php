<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A referral only pays out once the invited user completes a first booking,
 * which is what `qualified_at` records. Registration alone is not enough.
 */
class Referral extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_REGISTERED = 'registered';
    public const STATUS_QUALIFIED = 'qualified';
    public const STATUS_REWARDED = 'rewarded';

    protected $fillable = [
        'referrer_id', 'invited_user_id', 'code', 'invited_email', 'invited_phone',
        'status', 'qualifying_booking_id', 'referrer_reward_minor',
        'invited_reward_minor', 'registered_at', 'qualified_at', 'rewarded_at',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'qualified_at' => 'datetime',
            'rewarded_at' => 'datetime',
            'referrer_reward_minor' => 'integer',
            'invited_reward_minor' => 'integer',
        ];
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function invitedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_user_id');
    }

    public function qualifyingBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'qualifying_booking_id');
    }
}
