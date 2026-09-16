<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Generates the human-readable reference customers quote on the phone:
 * PF-2026-000125. The number restarts each year and is taken under a row
 * lock, so two bookings created in the same instant cannot collide.
 *
 * A model opts in by declaring:
 *
 *     protected string $referencePrefix = 'PF';
 */
trait HasReference
{
    public static function bootHasReference(): void
    {
        static::creating(function (Model $model): void {
            $column = $model->getReferenceColumn();

            if (empty($model->{$column})) {
                $model->{$column} = $model->generateReference();
            }
        });
    }

    public function getReferenceColumn(): string
    {
        return 'reference';
    }

    public function getReferencePrefix(): string
    {
        return property_exists($this, 'referencePrefix')
            ? $this->referencePrefix
            : config('pakfix.booking.reference_prefix', 'PF');
    }

    public function generateReference(): string
    {
        $prefix = $this->getReferencePrefix();
        $year = now()->year;
        $column = $this->getReferenceColumn();
        $table = $this->getTable();
        $like = sprintf('%s-%d-%%', $prefix, $year);

        // Serialise the read-then-write so concurrent creates cannot both
        // read the same highest number.
        return DB::transaction(function () use ($table, $column, $prefix, $year, $like): string {
            $last = DB::table($table)
                ->where($column, 'like', $like)
                ->lockForUpdate()
                ->orderByDesc($column)
                ->value($column);

            $next = $last === null
                ? 1
                : ((int) substr((string) $last, strrpos((string) $last, '-') + 1)) + 1;

            return sprintf('%s-%d-%06d', $prefix, $year, $next);
        });
    }
}
