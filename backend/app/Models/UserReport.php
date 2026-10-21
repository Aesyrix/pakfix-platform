<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Someone reporting another person (or one of their chat messages).
 *
 * @property int $id
 * @property string $uuid
 * @property string $reason
 * @property string|null $details
 * @property string|null $snapshot
 * @property string $status
 * @property string|null $resolution
 * @property Carbon|null $handled_at
 * @property Carbon $created_at
 */
class UserReport extends Model
{
    use HasUuid;

    public const REASONS = ['harassment', 'inappropriate', 'spam', 'fraud', 'safety', 'off_platform', 'other'];

    public const STATUS_OPEN = 'open';

    public const STATUSES = ['open', 'reviewing', 'actioned', 'dismissed'];

    protected $fillable = [
        'reporter_id', 'reported_user_id', 'booking_id', 'booking_message_id',
        'reason', 'details', 'snapshot', 'status', 'resolution', 'handled_by', 'handled_at',
    ];

    protected function casts(): array
    {
        return ['handled_at' => 'datetime'];
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reported(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    /** @param Builder<UserReport> $query */
    public function scopeUnresolved(Builder $query): Builder
    {
        return $query->whereIn('status', ['open', 'reviewing']);
    }
}
