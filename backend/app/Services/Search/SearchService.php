<?php

declare(strict_types=1);

namespace App\Services\Search;

use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Global site search across services, professionals, articles and FAQs.
 *
 * Database-backed and deliberately simple. Every query goes through
 * `matching()`, so swapping in Meilisearch or Elasticsearch later means
 * replacing this class, not hunting down LIKE clauses across controllers.
 *
 * Only public records are searchable: unpublished posts, inactive
 * categories and unverified professionals never appear.
 */
class SearchService
{
    public const MIN_LENGTH = 2;

    /** @return array<string, Collection> */
    public function search(string $term, int $perType = 5): array
    {
        $term = trim($term);

        if (mb_strlen($term) < self::MIN_LENGTH) {
            return [
                'categories' => collect(),
                'services' => collect(),
                'technicians' => collect(),
                'posts' => collect(),
                'faqs' => collect(),
            ];
        }

        return [
            'categories' => $this->matching(ServiceCategory::active(), ['name', 'description', 'trade_name'], $term)
                ->orderBy('sort_order')
                ->limit($perType)
                ->get(),

            'services' => $this->matching(Service::active()->with('category'), ['name', 'description'], $term)
                ->limit($perType)
                ->get(),

            'technicians' => $this->matching(
                TechnicianProfile::publiclyVisible()->with(['user', 'city']),
                ['business_name', 'bio'],
                $term,
                fn (Builder $q) => $q->orWhereHas('user', fn (Builder $u) => $this->whereLike($u, 'name', $term))
            )
                ->orderByDesc('rating_average')
                ->limit($perType)
                ->get(),

            'posts' => $this->matching(BlogPost::published(), ['title', 'excerpt'], $term)
                ->latest('published_at')
                ->limit($perType)
                ->get(),

            'faqs' => $this->matching(Faq::active(), ['question', 'answer'], $term)
                ->limit($perType)
                ->get(),
        ];
    }

    /** Matches when any of the columns contains the term. */
    private function matching(Builder $query, array $columns, string $term, ?callable $extra = null): Builder
    {
        return $query->where(function (Builder $q) use ($columns, $term, $extra): void {
            foreach ($columns as $column) {
                $q->orWhere(fn (Builder $inner) => $this->whereLike($inner, $column, $term));
            }

            if ($extra) {
                $extra($q);
            }
        });
    }

    /**
     * Case-insensitive, and safe against a term containing % or _.
     *
     * LOWER() LIKE behaves the same on PostgreSQL, MySQL and SQLite, unlike
     * LIKE or ILIKE alone. `!` is used as the escape character because a
     * backslash means different things in each database's string literals.
     */
    private function whereLike(Builder $query, string $column, string $term): Builder
    {
        $escaped = strtr(mb_strtolower($term), ['!' => '!!', '%' => '!%', '_' => '!_']);
        $wrapped = $query->getQuery()->getGrammar()->wrap($query->qualifyColumn($column));

        return $query->whereRaw("LOWER({$wrapped}) LIKE ? ESCAPE '!'", ['%' . $escaped . '%']);
    }
}
