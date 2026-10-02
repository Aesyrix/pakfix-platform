<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Frontend\FrontendBuilder;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

/**
 * php artisan pakfix:serve
 *
 * Runs the whole platform -- website and API -- from one PHP server on one
 * port. Builds the website first if it has never been built.
 */
class ServeCommand extends Command
{
    protected $signature = 'pakfix:serve
                            {--host=127.0.0.1 : Address to listen on}
                            {--port=8000 : Port to listen on}
                            {--build : Rebuild the website before starting}';

    protected $description = 'Run the PakFix website and API together from one PHP server';

    public function handle(FrontendBuilder $builder): int
    {
        if ($this->option('build') || ! $builder->isBuilt()) {
            $this->components->info($builder->isBuilt() ? 'Rebuilding the website first.' : 'The website has not been built yet; building it first.');

            // The build calls the API, which needs a migrated database.
            $this->call('migrate', ['--force' => true]);

            if ($this->call('pakfix:build', ['--url' => $this->url()]) !== self::SUCCESS) {
                return self::FAILURE;
            }
        }

        $this->newLine();
        $this->components->info('PakFix is starting.');
        $this->components->twoColumnDetail('Website', $this->url());
        $this->components->twoColumnDetail('API', $this->url() . '/api/v1');
        $this->components->twoColumnDetail('Admin', $this->url() . '/admin');
        $this->components->twoColumnDetail('Stop', 'Ctrl+C');
        $this->newLine();

        // PakFix's own router rather than `artisan serve`: the built-in
        // server would otherwise hand /services to the directory the build
        // created there, instead of to Laravel. See backend/server.php.
        $server = new Process(
            [
                PHP_BINARY,
                '-S', "{$this->option('host')}:{$this->option('port')}",
                // The document root must be public/, or the built assets the
                // router hands back to the server are looked for in the wrong
                // place and the site loads without its CSS.
                '-t', public_path(),
                base_path('server.php'),
            ],
            base_path(),
            ['APP_URL' => $this->url()]
        );

        $server->setTimeout(null);
        $server->setTty(false);

        return $server->run(function (string $type, string $buffer): void {
            $this->output->write($buffer);
        });
    }

    private function url(): string
    {
        $host = $this->option('host') === '0.0.0.0' ? 'localhost' : $this->option('host');

        return "http://{$host}:{$this->option('port')}";
    }
}
