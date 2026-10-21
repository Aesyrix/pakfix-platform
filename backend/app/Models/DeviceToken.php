<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A phone that receives push notifications for a user.
 *
 * @property int $id
 * @property int $user_id
 * @property string $token
 * @property string $platform android|ios
 * @property bool $is_active
 */
class DeviceToken extends Model
{
    protected $fillable = ['user_id', 'token', 'platform', 'device_name', 'app_version', 'last_used_at', 'is_active'];

    protected $hidden = ['token'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'last_used_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param Builder<DeviceToken> $query */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
