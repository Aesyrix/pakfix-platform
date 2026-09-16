<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
| The Next.js app is a different origin from the API, so it needs explicit
| permission -- and because it authenticates with a Sanctum cookie,
| credentials must be allowed, which means the allowed origins list cannot
| be a wildcard. Extra origins (staging, preview deploys) come from
| CORS_ALLOWED_ORIGINS as a comma-separated list.
*/

$origins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
)));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_merge(
        [rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/')],
        $origins
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
