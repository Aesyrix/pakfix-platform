<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItem extends Model
{
    public const TYPE_LABOUR = 'labour';
    public const TYPE_MATERIAL = 'material';
    public const TYPE_VISIT_FEE = 'visit_fee';
    public const TYPE_OTHER = 'other';

    protected $fillable = [
        'quote_id', 'type', 'description', 'quantity', 'unit',
        'unit_price_minor', 'total_minor', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'unit_price_minor' => 'integer',
            'total_minor' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        // The line total is always derived, never accepted from the client.
        static::saving(function (self $item): void {
            $item->total_minor = (int) round($item->quantity * $item->unit_price_minor);
        });
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }
}
