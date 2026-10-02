<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Router for PHP's built-in web server
|--------------------------------------------------------------------------
| Used by `php artisan pakfix:serve`, and mirrors what public/.htaccess tells
| Apache to do:
|
|   - a request for a real file (JavaScript, CSS, an icon) is served from disk
|   - everything else goes to Laravel's front controller
|
| The distinction that matters is files versus directories. The built-in
| server's default behaviour hands a request like /services to the directory
| the build created at public/services, which then has no index and 404s --
| even though public/services.html is the page. Only real files short-circuit
| here, so Laravel resolves every page URL exactly as it does on Apache and
| nginx.
*/

$publicPath = __DIR__ . '/public';
$uri = urldecode((string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH));

// Refuse anything trying to climb out of public/.
if (str_contains($uri, '..')) {
    http_response_code(400);

    return true;
}

$requested = realpath($publicPath . $uri);
$root = realpath($publicPath);

if ($uri !== '/' && $requested !== false && $root !== false && is_file($requested) && str_starts_with($requested, $root)) {
    // Let the built-in server stream the file itself.
    return false;
}

$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = $publicPath . '/index.php';

require_once $publicPath . '/index.php';
