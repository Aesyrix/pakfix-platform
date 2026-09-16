<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * An append-only record of consequential actions: who did what, to which
 * record, and what the values were before and after.
 *
 * There is no updated_at and no update path -- a row is written once. Writes
 * go through AuditLogger rather than being constructed by callers.
 */
class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'actor_id', 'actor_role', 'action', 'auditable_type', 'auditable_id',
        'old_values', 'new_values', 'description', 'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeForAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    public function scopeForRecord(Builder $query, Model $record): Builder
    {
        return $query->where('auditable_type', $record->getMorphClass())
            ->where('auditable_id', $record->getKey());
    }

    /** The fields that actually changed, for rendering a compact diff. */
    public function changedKeys(): array
    {
        return array_keys(array_diff_assoc(
            $this->new_values ?? [],
            $this->old_values ?? []
        ));
    }
}
