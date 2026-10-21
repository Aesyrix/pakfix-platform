<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * `blocker` does not want to deal with `blocked` again: no chat, and no
 * requests or offers between them.
 *
 * @property int $blocker_id
 * @property int $blocked_id
 * @property Carbon $created_at
 */
class UserBlock extends Model
{
    protected $fillable = ['blocker_id', 'blocked_id', 'reason'];

    public function blocked(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocked_id');
    }

    public function blocker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocker_id');
    }
}
