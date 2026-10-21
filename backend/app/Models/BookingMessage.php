<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One chat message on a booking: text, a photo, or both.
 *
 * @property int $id
 * @property string $uuid
 * @property int $booking_id
 * @property int $sender_id
 * @property string|null $body
 * @property string|null $attachment_disk
 * @property string|null $attachment_path
 * @property string|null $attachment_mime
 * @property Carbon|null $read_at
 * @property Carbon $created_at
 */
class BookingMessage extends Model
{
    use HasUuid;

    protected $fillable = [
        'booking_id', 'sender_id', 'body', 'attachment_disk', 'attachment_path', 'attachment_mime', 'read_at',
    ];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function hasAttachment(): bool
    {
        return $this->attachment_path !== null;
    }
}
