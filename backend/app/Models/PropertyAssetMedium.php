<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyAssetMedium extends Model
{
    protected $table = 'property_asset_media';

    protected $fillable = [
        'property_asset_id', 'type', 'disk', 'path',
        'original_name', 'mime_type', 'size_bytes',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(PropertyAsset::class, 'property_asset_id');
    }
}
