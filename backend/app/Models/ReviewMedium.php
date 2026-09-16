<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewMedium extends Model
{
    protected $table = 'review_media';

    protected $fillable = ['review_id', 'disk', 'path', 'thumbnail_path'];

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }
}
