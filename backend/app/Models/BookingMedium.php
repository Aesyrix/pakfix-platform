<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingMedium extends Model
{
    protected $table = 'booking_media';

    public const CONTEXT_PROBLEM = 'problem';
    public const CONTEXT_BEFORE = 'before';
    public const CONTEXT_AFTER = 'after';
    public const CONTEXT_INVOICE = 'invoice';

    protected $fillable = [
        'booking_id', 'uploaded_by_user_id', 'context', 'type', 'disk', 'path',
        'thumbnail_path', 'original_name', 'mime_type', 'size_bytes',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    public function scopeContext(Builder $query, string $context): Builder
    {
        return $query->where('context', $context);
    }
}
