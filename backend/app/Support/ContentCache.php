<?php

declare(strict_types=1);

namespace App\Support;

use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Cache for public content, invalidated all at once.
 *
 * Every key is prefixed with a version number. Publishing an edit bumps the
 * version, which orphans every old entry in one step. That works on every
 * cache store -- file, database, Redis -- unlike tags, and it means nobody
 * has to remember which of a dozen key combinations a given edit touched.
 */
final class ContentCache
{
    private const VERSION_KEY = 'content-cache:version';

    public static function remember(string $key, int $seconds, Closure $callback): mixed
    {
        return Cache::remember(self::key($key), $seconds, $callback);
    }

    /** Invalidates every cached content response. Call after any CMS write. */
    public static function flush(): void
    {
        Cache::forever(self::VERSION_KEY, self::version() + 1);
    }

    public static function version(): int
    {
        return (int) Cache::get(self::VERSION_KEY, 1);
    }

    private static function key(string $key): string
    {
        return sprintf('content:v%d:%s', self::version(), $key);
    }
}
