<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Frontend\FrontendBuilder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use Symfony\Component\Process\Process;
use ZipArchive;

/**
 * php artisan pakfix:package
 *
 * Produces one zip containing everything a PHP-only server needs: the
 * application, its production dependencies and the already-built website.
 * Upload it, extract it, run `php artisan pakfix:deploy`, done -- no Node,
 * npm or Composer required on the server.
 *
 * Never packaged: .env (secrets), local databases, logs, sessions, caches,
 * tests and development dependencies.
 */
class PackageCommand extends Command
{
    protected $signature = 'pakfix:package
                            {--build : Rebuild the website before packaging}
                            {--url= : Public URL of the live site, used for the build (defaults to APP_URL)}
                            {--output= : Folder to write the zip into (defaults to ../dist)}';

    protected $description = 'Package PakFix as a ready-to-upload zip for a PHP-only server';

    /** Top-level and nested paths left out of the release. */
    private const EXCLUDE = [
        '.env', '.env.backup', '.env.production', '.phpunit.result.cache', '.phpunit.cache',
        'node_modules', 'tests', 'vendor',
        'storage/logs', 'storage/framework/cache/data', 'storage/framework/sessions',
        'storage/framework/views', 'storage/framework/testing', 'storage/app/private',
        'storage/app/public', 'public/storage', 'public/hot',
        'database/database.sqlite', 'bootstrap/cache/config.php', 'bootstrap/cache/routes-v7.php',
        'bootstrap/cache/events.php',
    ];

    public function handle(FrontendBuilder $builder): int
    {
        if (! class_exists(ZipArchive::class)) {
            $this->components->error('The PHP zip extension is required to package a release.');

            return self::FAILURE;
        }

        if ($this->option('build') || ! $builder->isBuilt()) {
            $url = (string) ($this->option('url') ?: config('app.url'));

            if ($this->call('pakfix:build', ['--url' => $url]) !== self::SUCCESS) {
                return self::FAILURE;
            }
        }

        $stage = storage_path('framework/pakfix-release-' . date('YmdHis'));
        $outputDir = rtrim((string) ($this->option('output') ?: base_path('../dist')), '\\/');
        $zipPath = $outputDir . '/pakfix-release-' . date('Ymd-His') . '.zip';

        try {
            $this->components->task('Copying the application', fn () => $this->copyApplication($stage));
            $this->components->task('Installing production dependencies', fn () => $this->installVendor($stage));
            $this->components->task('Writing deployment notes', fn () => $this->writeNotes($stage));

            File::ensureDirectoryExists($outputDir);
            $this->components->task('Creating the zip', fn () => $this->zip($stage, $zipPath));
        } finally {
            File::deleteDirectory($stage);
        }

        $this->newLine();
        $this->components->info('Release packaged: ' . realpath($zipPath));
        $this->components->twoColumnDetail('Size', number_format(filesize($zipPath) / 1048576, 1) . ' MB');
        $this->line('  Upload and extract it on the server, create .env from .env.example, then run:');
        $this->line('  <info>php artisan pakfix:deploy</info>');

        return self::SUCCESS;
    }

    private function copyApplication(string $stage): bool
    {
        $source = base_path();
        $relativeOf = fn (\SplFileInfo $item): string => str_replace('\\', '/', substr($item->getPathname(), strlen($source) + 1));

        // Prune excluded folders at the directory level, so vendor/ and
        // node_modules/ are never walked file by file.
        $items = new RecursiveIteratorIterator(
            new \RecursiveCallbackFilterIterator(
                new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS),
                fn (\SplFileInfo $item) => ! $this->isExcluded($relativeOf($item))
                    && ! str_starts_with($relativeOf($item), 'storage/framework/pakfix-release-')
            ),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($items as $item) {
            $relative = $relativeOf($item);
            $target = "{$stage}/{$relative}";

            if ($item->isDir()) {
                File::ensureDirectoryExists($target);
            } else {
                File::ensureDirectoryExists(dirname($target));
                File::copy($item->getPathname(), $target);
            }
        }

        // Laravel needs these folders to exist and be writable on the server.
        foreach (['storage/logs', 'storage/framework/cache/data', 'storage/framework/sessions', 'storage/framework/views', 'storage/app/public', 'bootstrap/cache'] as $directory) {
            File::ensureDirectoryExists("{$stage}/{$directory}");
        }

        return true;
    }

    private function isExcluded(string $relative): bool
    {
        foreach (self::EXCLUDE as $excluded) {
            if ($relative === $excluded || str_starts_with($relative, $excluded . '/')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Production dependencies only. Falls back to copying the local vendor
     * folder when Composer is not installed, so packaging never fails outright.
     */
    private function installVendor(string $stage): bool
    {
        $composer = Process::fromShellCommandline('composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --no-progress', $stage);
        $composer->setTimeout(600);

        if ($composer->run() === 0) {
            return true;
        }

        $this->newLine();
        $this->components->warn('Composer was not available, so the local vendor folder (including development packages) was copied instead.');
        File::copyDirectory(base_path('vendor'), "{$stage}/vendor");

        return true;
    }

    private function writeNotes(string $stage): bool
    {
        file_put_contents("{$stage}/DEPLOY.txt", <<<'TXT'
PakFix release
==============

This folder is the complete application with the website already built.
The server only needs PHP 8.2+ with pdo_pgsql (or pdo_mysql), mbstring,
openssl, fileinfo, gd, zip and bcmath. No Node, npm or Composer.

1. Point your domain's web root at the public/ folder inside this directory.
   (On shared hosting, see docs/deployment.md for the public_html layout.)
2. Copy .env.example to .env and fill in:
     APP_ENV=production
     APP_DEBUG=false
     APP_URL=https://your-domain
     DB_* for your database
3. Run:
     php artisan pakfix:deploy
4. Create your admin account:
     php artisan pakfix:admin
5. Add the scheduler to cron (once):
     * * * * * cd /path/to/this/folder && php artisan schedule:run >> /dev/null 2>&1

To release an update, upload a new package over this one (keeping .env and
storage/) and run php artisan pakfix:deploy again.
TXT);

        return true;
    }

    private function zip(string $stage, string $zipPath): bool
    {
        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return false;
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($stage, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($files as $file) {
            $relative = 'pakfix/' . str_replace('\\', '/', substr($file->getPathname(), strlen($stage) + 1));

            $file->isDir() ? $zip->addEmptyDir($relative) : $zip->addFile($file->getPathname(), $relative);
        }

        return $zip->close();
    }
}
