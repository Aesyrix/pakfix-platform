<?php

declare(strict_types=1);

use App\Http\Controllers\FrontendController;
use App\Http\Middleware\EnsureUserIsActive;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // Everything that is not the API is the website. Registered last and
        // outside the web middleware group, so serving a page never starts a
        // session or writes to the database.
        then: function (): void {
            Route::fallback(FrontendController::class)->name('frontend');
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum's stateful guard lets the Next.js app authenticate with a
        // cookie while the mobile apps use bearer tokens against the same
        // routes and the same controllers.
        $middleware->statefulApi();

        $middleware->alias([
            'active' => EnsureUserIsActive::class,
            'role' => Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        /*
         * Every API failure comes back in the same envelope as every success,
         * so a client never has to guess which shape it received. HTML error
         * pages are left alone for the handful of web routes.
         */
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            return match (true) {
                $e instanceof ValidationException => ApiResponse::validationFailed($e->errors(), $e->getMessage()),

                $e instanceof AuthenticationException => ApiResponse::unauthorized(),

                $e instanceof AuthorizationException => ApiResponse::forbidden($e->getMessage()),

                $e instanceof ModelNotFoundException,
                $e instanceof NotFoundHttpException => ApiResponse::notFound(
                    'The requested resource does not exist.'
                ),

                $e instanceof TooManyRequestsHttpException => ApiResponse::tooManyRequests(),

                // Any other HTTP exception keeps its own status and message.
                $e instanceof HttpExceptionInterface => ApiResponse::error(
                    $e->getMessage() ?: 'Request failed.',
                    $e->getStatusCode()
                ),

                // Anything unexpected: never leak internals outside debug mode.
                default => config('app.debug')
                    ? null
                    : ApiResponse::serverError(),
            };
        });
    })->create();
