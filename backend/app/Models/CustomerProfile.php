<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The customer-specific half of a profile: what they told us at onboarding
 * plus the running totals the dashboard shows.
 */
class CustomerProfile extends Model
{
    public const OCCUPANCY_OWNER = 'owner';
    public const OCCUPANCY_TENANT = 'tenant';

    protected $fillable = [
        'user_id', 'occupancy', 'interests', 'default_property_id',
        'lifetime_spend_minor', 'completed_bookings_count', 'wallet_balance_minor',
    ];

    protected function casts(): array
    {
        return [
            'interests' => 'array',
            'lifetime_spend_minor' => 'integer',
            'completed_bookings_count' => 'integer',
            'wallet_balance_minor' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function defaultProperty(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'default_property_id');
    }
}
