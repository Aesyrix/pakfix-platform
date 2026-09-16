<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * An article on the PakFix blog. Posts carry their own SEO fields and can
 * point at the service category they are about, which is what powers the
 * "related service" call to action at the end of a guide.
 */
class BlogPost extends Model
{
    use HasUuid;
    use SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'blog_category_id', 'author_id', 'service_category_id', 'title', 'slug',
        'excerpt', 'body', 'featured_image_path', 'featured_image_alt',
        'seo_title', 'seo_description', 'canonical_url', 'schema_markup',
        'cta_label', 'cta_url', 'reading_minutes', 'is_featured',
        'status', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'schema_markup' => 'array',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function booted(): void
    {
        // Reading time is derived from the body rather than typed in, so it
        // cannot drift out of date when an editor rewrites a section.
        static::saving(function (self $post): void {
            if ($post->isDirty('body')) {
                $words = str_word_count(strip_tags((string) $post->body));
                $post->reading_minutes = max(1, (int) ceil($words / 200));
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function serviceCategory(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(BlogTag::class, 'blog_post_tag');
    }

    /** Only posts whose publish time has actually arrived. */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PUBLISHED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function isVisible(): bool
    {
        return $this->status === self::STATUS_PUBLISHED
            && $this->published_at !== null
            && $this->published_at->isPast();
    }
}
