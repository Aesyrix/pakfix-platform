<?php

declare(strict_types=1);

namespace App\Http\Resources\Concerns;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Null-safe relation embedding for API resources.
 *
 * `new SomeResource($this->whenLoaded('city'))` looks right and is wrong: a
 * relation that is loaded but empty -- a user with no city, a booking with no
 * technician yet -- hands the resource a null, which then explodes on the
 * first property access. Optional belongs-to relations are the normal case in
 * this domain, so every resource goes through these helpers instead.
 *
 * A relation that is absent or empty serialises as null rather than vanishing,
 * so the clients can rely on the key always being present.
 */
trait ResolvesRelations
{
    /**
     * Embeds a single related model, or null.
     *
     * @param  class-string<JsonResource>  $resourceClass
     */
    protected function relation(string $relation, string $resourceClass): ?array
    {
        if (! $this->resource->relationLoaded($relation)) {
            return null;
        }

        $related = $this->resource->getRelation($relation);

        return $related === null
            ? null
            : (new $resourceClass($related))->resolve(request());
    }

    /**
     * Embeds a related collection, or an empty list when it is not loaded.
     *
     * @param  class-string<JsonResource>  $resourceClass
     */
    protected function relationCollection(string $relation, string $resourceClass): array
    {
        if (! $this->resource->relationLoaded($relation)) {
            return [];
        }

        return collect($this->resource->getRelation($relation))
            ->map(fn ($model) => (new $resourceClass($model))->resolve(request()))
            ->values()
            ->all();
    }

    /**
     * Runs a callback only when a relation is loaded and present, so a
     * resource can shape a few fields without a whole nested resource class.
     */
    protected function whenRelation(string $relation, callable $callback): mixed
    {
        if (! $this->resource->relationLoaded($relation)) {
            return null;
        }

        $related = $this->resource->getRelation($relation);

        return $related === null ? null : $callback($related);
    }
}
