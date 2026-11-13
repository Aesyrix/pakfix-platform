<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * One entry in a person's notifications inbox.
 *
 * @property int $id
 * @property string $uuid
 * @property int $user_id
 * @property string $type
 * @property string $title_en
 * @property ?string $body_en
 * @property string $title_ur
 * @property ?string $body_ur
 * @property ?string $route
 * @property ?\Illuminate\Support\Carbon $read_at
 * @property \Illuminate\Support\Carbon $created_at
 */
class InboxNotification extends Model
{
    use MassPrunable;

    /** Kept for 90 days. */
    public function prunable(): Builder
    {
        return static::query()->where('created_at', '<', now()->subDays(90));
    }

    protected $fillable = ['user_id', 'type', 'title_en', 'body_en', 'title_ur', 'body_ur', 'route', 'read_at'];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (InboxNotification $notification): void {
            $notification->uuid ??= (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param Builder<InboxNotification> $query */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    /**
     * The website page for an app route, so a notification opens the same
     * thing in both. Unknown routes open the account home.
     */
    public static function webPath(?string $route): ?string
    {
        if ($route === null || $route === '') {
            return null;
        }

        $patterns = [
            '#^/pro/jobs/([0-9a-f-]{36})$#' => '/pro/jobs/view?id=$1',
            '#^/pro/bookings/([0-9a-f-]{36})$#' => '/pro/bookings/view?id=$1',
            '#^/requests/([0-9a-f-]{36})$#' => '/dashboard/requests/view?id=$1',
            '#^/bookings/([0-9a-f-]{36})$#' => '/dashboard/bookings/view?id=$1',
            '#^/verification$#' => '/pro/verification',
        ];

        foreach ($patterns as $pattern => $replacement) {
            if (preg_match($pattern, $route) === 1) {
                return (string) preg_replace($pattern, $replacement, $route);
            }
        }

        return null;
    }
}
