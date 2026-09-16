<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One step in a booking's life. Append-only: there is no updated_at and
 * nothing in the codebase updates or deletes these rows.
 */
class BookingStatusHistory extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'booking_status_history';

    protected $fillable = [
        'booking_id', 'from_status', 'to_status',
        'changed_by_user_id', 'actor_role', 'note', 'meta',
    ];

    protected function casts(): array
    {
        return [
            'from_status' => BookingStatus::class,
            'to_status' => BookingStatus::class,
            'meta' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
