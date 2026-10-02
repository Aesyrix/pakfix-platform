<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin\Concerns;

use App\Services\Audit\AuditLogger;
use App\Support\ContentCache;
use Illuminate\Database\Eloquent\Model;

/**
 * Every CMS write does two things besides saving: it leaves an audit record
 * of who changed what, and it invalidates the public content cache so the
 * change is visible on the next page load.
 */
trait PublishesContent
{
    protected function published(string $action, Model $model, array $original = [], ?string $description = null): void
    {
        $logger = app(AuditLogger::class);

        if ($original === [] || $model->wasRecentlyCreated) {
            $logger->record($action, $model, [], $model->getAttributes(), $description);
        } else {
            $logger->recordChanges($action, $model, $original, $description);
        }

        ContentCache::flush();
    }

    protected function unpublished(string $action, Model $model, ?string $description = null): void
    {
        app(AuditLogger::class)->record($action, $model, $model->getAttributes(), [], $description);

        ContentCache::flush();
    }
}
