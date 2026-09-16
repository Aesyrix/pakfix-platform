<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Gives a model a public UUID alongside its auto-increment primary key.
 *
 * Sequential ids stay internal, where they keep joins fast; the UUID is what
 * appears in API responses and URLs, so nobody can walk /bookings/1,
 * /bookings/2 and count the business.
 */
trait HasUuid
{
    public static function bootHasUuid(): void
    {
        static::creating(function (Model $model): void {
            if (empty($model->{$model->getUuidColumn()})) {
                $model->{$model->getUuidColumn()} = (string) Str::uuid();
            }
        });
    }

    public function getUuidColumn(): string
    {
        return 'uuid';
    }

    /** Route-model binding resolves on the UUID, never the id. */
    public function getRouteKeyName(): string
    {
        return $this->getUuidColumn();
    }

    public function scopeWhereUuid(Builder $query, string $uuid): Builder
    {
        return $query->where($this->getUuidColumn(), $uuid);
    }
}
