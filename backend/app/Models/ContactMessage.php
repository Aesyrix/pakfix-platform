<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A message sent from the public contact form. Kept apart from support
 * tickets because the sender usually has no account yet.
 */
class ContactMessage extends Model
{
    use HasUuid;

    public const STATUS_NEW = 'new';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_HANDLED = 'handled';

    public const TOPICS = ['general', 'booking', 'professional', 'partnership', 'press', 'other'];

    protected $fillable = [
        'user_id', 'name', 'email', 'phone', 'topic', 'subject', 'message',
        'status', 'handled_by_user_id', 'handled_at', 'internal_note',
        'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return ['handled_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by_user_id');
    }

    public function scopeUnhandled(Builder $query): Builder
    {
        return $query->where('status', '!=', self::STATUS_HANDLED);
    }
}
