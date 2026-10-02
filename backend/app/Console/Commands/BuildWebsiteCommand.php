<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Frontend\FrontendBuilder;
use Illuminate\Console\Command;
use RuntimeException;

/**
 * php artisan pakfix:build
 *
 * Compiles the website and installs it into public/, so PHP serves it.
 * Needs Node on the machine running the build -- not on the server, if you
 * build locally and upload with pakfix:package.
 */
class BuildWebsiteCommand extends Command
{
    protected $signature = 'pakfix:build
                            {--url= : The public URL the site will be served from (defaults to APP_URL)}';

    protected $description = 'Build the PakFix website and install it into public/ so PHP serves it';

    public function handle(FrontendBuilder $builder): int
    {
        if (! $builder->canBuild()) {
            $this->components->error('Node.js and npm are needed to build the website, and were not found.');
            $this->line('  Install Node 20 or newer from https://nodejs.org, or build on another machine');
            $this->line('  and upload the result with: php artisan pakfix:package');

            return self::FAILURE;
        }

        $url = (string) ($this->option('url') ?: config('app.url'));
        $started = microtime(true);

        $this->components->info("Building the PakFix website for {$url}");

        try {
            $pages = $builder
                ->onOutput(fn (string $line) => $this->line($line))
                ->build($url);
        } catch (RuntimeException $exception) {
            $this->newLine();
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->newLine();
        $this->components->info(sprintf(
            'Website built: %d pages installed in public/ in %ds.',
            $pages,
            (int) round(microtime(true) - $started)
        ));

        return self::SUCCESS;
    }
}
