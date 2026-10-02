<?php

declare(strict_types=1);

namespace App\Services\Frontend;

use Closure;
use Illuminate\Support\Facades\File;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RuntimeException;
use Symfony\Component\Process\Process;

/**
 * Compiles the Next.js website to static files and installs them in public/.
 *
 * The build renders every public page by calling this same API, so the
 * builder starts a short-lived PHP server for the duration of the build and
 * points Next.js at it. Nothing about the live site changes until the build
 * has succeeded; then the new files are copied over the old ones, and files
 * the previous build left behind are removed using a manifest.
 */
class FrontendBuilder
{
    private const MANIFEST = '.pakfix-build.json';

    /** Files in public/ that belong to Laravel and must never be touched. */
    private const PROTECTED = ['index.php', '.htaccess', 'web.config', 'storage', 'hot', self::MANIFEST];

    /** @var Closure(string): void */
    private Closure $output;

    public function __construct()
    {
        $this->output = static function (string $line): void {
        };
    }

    /** @param Closure(string): void $output */
    public function onOutput(Closure $output): self
    {
        $this->output = $output;

        return $this;
    }

    public function frontendPath(): string
    {
        return rtrim((string) (env('PAKFIX_FRONTEND_PATH') ?: realpath(base_path('../frontend')) ?: base_path('../frontend')), '\\/');
    }

    public function isBuilt(): bool
    {
        return is_file(public_path('index.html'));
    }

    /** Whether Node and npm are installed on this machine. */
    public function canBuild(): bool
    {
        return $this->shell('node --version')->run() === 0
            && $this->shell('npm --version')->run() === 0
            && is_file($this->frontendPath() . '/package.json');
    }

    /**
     * Runs the whole build. Returns the number of HTML pages installed.
     *
     * @throws RuntimeException when any step fails; the live site is untouched.
     */
    public function build(string $siteUrl): int
    {
        $frontend = $this->frontendPath();

        if (! is_file("{$frontend}/package.json")) {
            throw new RuntimeException("No frontend found at {$frontend}. Set PAKFIX_FRONTEND_PATH if it lives elsewhere.");
        }

        if (! is_dir("{$frontend}/node_modules")) {
            $this->say('Installing frontend dependencies (first build only)...');
            $this->runOrFail(
                $this->shell(is_file("{$frontend}/package-lock.json") ? 'npm ci --no-audit --no-fund' : 'npm install --no-audit --no-fund', $frontend),
                'Installing frontend dependencies failed.'
            );
        }

        [$server, $apiUrl] = $this->startApiServer();

        try {
            File::deleteDirectory("{$frontend}/out");

            $this->say("Building the website against {$apiUrl} ...");

            $this->runOrFail($this->shell('npm run build', $frontend, [
                'PAKFIX_STATIC_EXPORT' => '1',
                // The browser talks to the API on the same origin it loaded the page from.
                'NEXT_PUBLIC_API_URL' => '/api/v1',
                // The build itself talks to the temporary server.
                'PAKFIX_BUILD_API_URL' => $apiUrl,
                'NEXT_PUBLIC_SITE_URL' => rtrim($siteUrl, '/'),
                'NEXT_TELEMETRY_DISABLED' => '1',
            ]), 'The website build failed. The live site has not been changed.');
        } finally {
            $server->stop(3);
        }

        if (! is_file("{$frontend}/out/index.html")) {
            throw new RuntimeException('The build finished but produced no index.html. The live site has not been changed.');
        }

        return $this->install("{$frontend}/out");
    }

    /**
     * Copies a finished export into public/, then removes files that only the
     * previous build had. Copy first, delete second: the site is never left
     * without a page it had a moment ago.
     */
    public function install(string $exportPath): int
    {
        $public = public_path();
        $previous = $this->readManifest();
        $installed = [];

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($exportPath, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($files as $file) {
            $relative = str_replace('\\', '/', substr($file->getPathname(), strlen($exportPath) + 1));

            if (in_array(explode('/', $relative)[0], self::PROTECTED, true)) {
                continue;
            }

            $target = "{$public}/{$relative}";
            File::ensureDirectoryExists(dirname($target));
            File::copy($file->getPathname(), $target);

            $installed[] = $relative;
        }

        $stale = array_values(array_filter(
            array_diff($previous, $installed),
            fn (string $path) => ! in_array(explode('/', $path)[0], self::PROTECTED, true)
        ));

        foreach ($stale as $path) {
            @unlink("{$public}/{$path}");
        }

        $this->removeEmptyDirectories($public, $stale);

        file_put_contents(
            "{$public}/" . self::MANIFEST,
            json_encode(['built_at' => now()->toIso8601String(), 'files' => $installed], JSON_PRETTY_PRINT)
        );

        return count(array_filter($installed, fn (string $path) => str_ends_with($path, '.html')));
    }

    // -----------------------------------------------------------------

    /** @return array{0: Process, 1: string} */
    private function startApiServer(): array
    {
        $port = $this->freePort();
        $router = base_path('vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php');

        $server = new Process([PHP_BINARY, '-S', "127.0.0.1:{$port}", $router], public_path(), [
            'APP_URL' => "http://127.0.0.1:{$port}",
        ]);
        $server->setTimeout(null);
        $server->start();

        $apiUrl = "http://127.0.0.1:{$port}/api/v1";

        for ($attempt = 0; $attempt < 60; $attempt++) {
            if (! $server->isRunning()) {
                throw new RuntimeException('The temporary API server could not start: ' . trim($server->getErrorOutput()));
            }

            $response = @file_get_contents("{$apiUrl}/bootstrap", false, stream_context_create([
                'http' => ['timeout' => 2, 'ignore_errors' => true],
            ]));

            if ($response !== false && str_contains($response, '"success":true')) {
                return [$server, $apiUrl];
            }

            usleep(250_000);
        }

        $server->stop(1);

        throw new RuntimeException(
            'The API did not respond during the build. Check that the database is reachable and migrated (php artisan migrate).'
        );
    }

    private function freePort(): int
    {
        $socket = @stream_socket_server('tcp://127.0.0.1:0', $errno, $error);

        if ($socket === false) {
            throw new RuntimeException("Could not find a free port: {$error}");
        }

        $name = stream_socket_get_name($socket, false);
        fclose($socket);

        return (int) substr((string) strrchr((string) $name, ':'), 1);
    }

    /**
     * A command run through the system shell, which is what lets `npm`
     * resolve to npm.cmd on Windows.
     */
    private function shell(string $command, ?string $cwd = null, array $env = []): Process
    {
        $process = Process::fromShellCommandline($command, $cwd, $env === [] ? null : $env);
        $process->setTimeout(null);

        return $process;
    }

    private function runOrFail(Process $process, string $message): void
    {
        $exitCode = $process->run(function (string $type, string $buffer): void {
            foreach (preg_split('/\R/', rtrim($buffer)) as $line) {
                if ($line !== '') {
                    ($this->output)('  ' . $line);
                }
            }
        });

        if ($exitCode !== 0) {
            throw new RuntimeException($message);
        }
    }

    /** @return list<string> */
    private function readManifest(): array
    {
        $path = public_path(self::MANIFEST);

        if (! is_file($path)) {
            return [];
        }

        return json_decode((string) file_get_contents($path), true)['files'] ?? [];
    }

    /**
     * Removes folders emptied by deleting stale build files. Only folders the
     * build itself created are considered, so nothing belonging to Laravel --
     * the storage link above all -- is ever touched.
     *
     * @param list<string> $stalePaths
     */
    private function removeEmptyDirectories(string $root, array $stalePaths): void
    {
        $directories = collect($stalePaths)
            ->flatMap(function (string $path): array {
                $parents = [];
                while (($path = dirname($path)) !== '.' && $path !== '') {
                    $parents[] = $path;
                }

                return $parents;
            })
            ->unique()
            // Deepest first, so a parent is checked after its children.
            ->sortByDesc(fn (string $path) => substr_count($path, '/'));

        foreach ($directories as $directory) {
            $absolute = "{$root}/{$directory}";

            if (is_dir($absolute) && ! is_link($absolute) && count(scandir($absolute)) === 2) {
                @rmdir($absolute);
            }
        }
    }

    private function say(string $line): void
    {
        ($this->output)($line);
    }
}
