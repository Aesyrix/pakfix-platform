<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Frontend\FrontendBuilder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * php artisan pakfix:install
 *
 * Takes a fresh checkout to a running platform: app key, database, reference
 * data, storage link and the built website. Safe to run again -- every step
 * checks whether it is still needed.
 *
 * Also the shared core of pakfix:deploy, which adds production optimisations.
 */
class InstallCommand extends Command
{
    protected $signature = 'pakfix:install
                            {--production : Never fall back to SQLite, and never seed demo accounts}
                            {--skip-build : Do not build the website}
                            {--fresh : Drop every table and start again (local only)}';

    protected $description = 'Set up PakFix: app key, database, seed data, storage link and the website';

    public function handle(FrontendBuilder $builder): int
    {
        $production = (bool) $this->option('production');

        $this->components->info('Setting up PakFix' . ($production ? ' for production' : ''));

        $this->ensureAppKey();

        if (! $this->ensureDatabase($production)) {
            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            if ($production || app()->isProduction()) {
                $this->components->error('--fresh is refused in production: it deletes every table.');

                return self::FAILURE;
            }

            $this->components->task('Rebuilding the database from scratch', fn () => Artisan::call('migrate:fresh', ['--force' => true]) === 0);
        } else {
            $this->components->task('Running database migrations', fn () => Artisan::call('migrate', ['--force' => true]) === 0);
        }

        $this->seedIfEmpty($production);

        if (! is_link(public_path('storage')) && ! is_dir(public_path('storage'))) {
            $this->components->task('Linking public storage', function () {
                // Shared hosts often disable symlink() and exec(), which makes
                // the command throw. That must not abort the whole install: the
                // deploy script creates the link from the shell beforehand.
                try {
                    return Artisan::call('storage:link') === 0;
                } catch (Throwable $exception) {
                    $this->components->warn('Could not link public storage: ' . $exception->getMessage());
                    $this->line('  Create it from the shell instead: <info>ln -s ../storage/app/public ' . public_path('storage') . '</info>');

                    return true;
                }
            });
        }

        if (! $this->option('skip-build')) {
            if ($builder->canBuild()) {
                if ($this->call('pakfix:build') !== self::SUCCESS) {
                    return self::FAILURE;
                }
            } elseif ($builder->isBuilt()) {
                $this->components->warn('Node.js was not found, so the existing website build was kept as it is.');
            } else {
                $this->components->error('Node.js was not found and the website has never been built.');
                $this->line('  Build on a machine with Node and upload it: php artisan pakfix:package');

                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }

    private function ensureAppKey(): void
    {
        if (config('app.key')) {
            return;
        }

        $this->components->task('Generating the application key', function () {
            Artisan::call('key:generate', ['--force' => true]);

            return true;
        });
    }

    /**
     * Connects to the configured database. On a developer machine with no
     * database server -- XAMPP without PostgreSQL, say -- it switches to a
     * local SQLite file rather than stopping the whole setup.
     */
    private function ensureDatabase(bool $production): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (Throwable $exception) {
            if ($production || app()->isProduction()) {
                $this->components->error('Could not connect to the database: ' . $exception->getMessage());
                $this->line('  Check the DB_* values in backend/.env.');

                return false;
            }
        }

        $connection = config('database.default');
        $this->components->warn("Could not connect to {$connection}; using a local SQLite database instead.");

        $path = database_path('database.sqlite');
        if (! is_file($path)) {
            touch($path);
        }

        $this->setEnvValue('DB_CONNECTION', 'sqlite');
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => $path]);
        DB::purge();

        return true;
    }

    private function seedIfEmpty(bool $production): void
    {
        // Keyed on roles, not users: a production install has no users until
        // the first admin is created.
        $empty = ! Schema::hasTable('roles') || DB::table('roles')->count() === 0;

        if (! $empty) {
            $this->components->twoColumnDetail('Seed data', 'already present, left untouched');

            return;
        }

        $this->components->task('Seeding reference data' . ($production ? '' : ' and demo accounts'), function () use ($production) {
            if ($production) {
                // DatabaseSeeder skips demo accounts in production on its own;
                // this makes the intent explicit for a non-production APP_ENV too.
                putenv('PAKFIX_SEED_DEMO=0');
            }

            return Artisan::call('db:seed', ['--force' => true]) === 0;
        });

        if ($production) {
            $this->newLine();
            $this->line('  Create the first admin account with: <info>php artisan pakfix:admin</info>');
        } else {
            $this->newLine();
            $this->line('  Demo sign-in: <info>admin@pakfix.pk</info> / <info>password</info>  (also ayesha@example.com, ahmed.electrician@example.com)');
        }
    }

    private function setEnvValue(string $key, string $value): void
    {
        $path = base_path('.env');

        if (! is_file($path)) {
            return;
        }

        $contents = (string) file_get_contents($path);
        $line = "{$key}={$value}";

        $contents = preg_match("/^{$key}=.*$/m", $contents)
            ? preg_replace("/^{$key}=.*$/m", $line, $contents)
            : rtrim($contents) . PHP_EOL . $line . PHP_EOL;

        file_put_contents($path, $contents);
    }
}
