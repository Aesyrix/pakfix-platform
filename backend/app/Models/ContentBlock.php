<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * An editable chunk of the public site. The shape of `content` depends on the
 * block type and is validated on write, so the frontend can rely on it.
 */
class ContentBlock extends Model
{
    protected $fillable = [
        'type', 'key', 'page', 'title', 'subtitle', 'content',
        'image_path', 'cta_label', 'cta_url', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return ['content' => 'array', 'is_active' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'key';
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeForPage(Builder $query, string $page): Builder
    {
        return $query->whereIn('page', [$page, 'global']);
    }
}
