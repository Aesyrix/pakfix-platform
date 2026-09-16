<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/** A standalone marketing or legal page, edited from the admin dashboard. */
class CmsPage extends Model
{
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'body', 'seo_title', 'seo_description',
        'is_system', 'is_published',
    ];

    protected function casts(): array
    {
        return ['is_system' => 'boolean', 'is_published' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /** System pages (terms, privacy) can be edited but never deleted. */
    public function isDeletable(): bool
    {
        return ! $this->is_system;
    }
}
