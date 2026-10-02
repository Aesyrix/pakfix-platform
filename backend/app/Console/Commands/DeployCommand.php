<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

/**
 * php artisan pakfix:deploy
 *
 * The production release, in order:
 *
 *   1. install  -- migrations, first-time reference data, storage link, and
 *                  the website build (skipped with a warning on a server
 *                  without Node, keeping the uploaded build)
 *   2. optimise -- config, route, view and event caches
 *   3. restart  -- tell queue workers to pick up the new code
 *
 * The site stays up throughout. Migrations run against the live database,
 * so write them to be backward compatible with the code still serving
 * requests for those few seconds.
 */
class DeployCommand extends Command
{
    protected $signature = 'pakfix:deploy
                            {--skip-build : Keep the current website build}';

    protected $description = 'Deploy PakFix: migrate, build the website, cache configuration, restart workers';

    public function handle(): int
    {
        $started = microtime(true);

        $this->warnAboutUnsafeProductionSettings();

        // Clear stale caches first, so this release reads the current .env.
        Artisan::call('optimize:clear');

        $install = $this->call('pakfix:install', [
            '--production' => true,
            '--skip-build' => (bool) $this->option('skip-build'),
        ]);

        if ($install !== self::SUCCESS) {
            $this->components->error('Deployment stopped. The site is still running the previous release.');

            return self::FAILURE;
        }

        $this->components->task('Caching configuration, routes, views and events', fn () => Artisan::call('optimize') === 0);
        $this->components->task('Restarting queue workers', fn () => Artisan::call('queue:restart') === 0);

        $this->newLine();
        $this->components->info(sprintf('PakFix deployed in %ds.', (int) round(microtime(true) - $started)));
        $this->components->twoColumnDetail('Site', (string) config('app.url'));
        $this->components->twoColumnDetail('Scheduler (add once to cron)', '* * * * * cd ' . base_path() . ' && php artisan schedule:run >> /dev/null 2>&1');
        $this->components->twoColumnDetail('Queue worker (keep running)', 'php artisan queue:work --tries=3 --max-time=3600');

        return self::SUCCESS;
    }

    /** Loud, not fatal: a staging box may legitimately run with debug on. */
    private function warnAboutUnsafeProductionSettings(): void
    {
        if (! app()->isProduction()) {
            $this->components->warn('APP_ENV is "' . app()->environment() . '", not "production". Set APP_ENV=production in .env for a live site.');
        }

        if (config('app.debug')) {
            $this->components->warn('APP_DEBUG is on. Set APP_DEBUG=false in .env before real customers use this site: debug mode shows internal errors to visitors.');
        }

        if (str_starts_with((string) config('app.url'), 'http://') && app()->isProduction()) {
            $this->components->warn('APP_URL uses http://. Serve the live site over https://.');
        }
    }
}
