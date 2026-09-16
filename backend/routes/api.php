<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\ServiceCategoryController;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PakFix API, version 1
|--------------------------------------------------------------------------
| Every client -- the Next.js site, the future Android app, the future iOS
| app -- talks to these routes. Nothing meaningful happens anywhere else, so
| shipping a mobile app later needs no new backend.
|
| Route files are grouped by who may call them:
|   public     no authentication, cached, safe to hit from a crawler
|   auth       signed in, active account
|   role-gated further restricted by role or permission
*/

Route::prefix('v1')->name('api.v1.')->group(function (): void {

    Route::get('/', fn () => ApiResponse::success([
        'name' => 'PakFix API',
        'version' => 'v1',
        'docs' => url('/docs/api'),
    ]))->name('index');

    // -----------------------------------------------------------------
    // Public
    // -----------------------------------------------------------------

    Route::get('bootstrap', [ContentController::class, 'bootstrap'])->name('bootstrap');

    Route::prefix('content')->name('content.')->group(function (): void {
        Route::get('blocks', [ContentController::class, 'blocks'])->name('blocks');
        Route::get('faqs', [ContentController::class, 'faqs'])->name('faqs');
        Route::get('testimonials', [ContentController::class, 'testimonials'])->name('testimonials');
        Route::get('pages/{slug}', [ContentController::class, 'page'])->name('page');
    });

    Route::prefix('locations')->name('locations.')->group(function (): void {
        Route::get('provinces', [LocationController::class, 'provinces'])->name('provinces');
        Route::get('cities', [LocationController::class, 'cities'])->name('cities');
        Route::get('cities/{slug}', [LocationController::class, 'city'])->name('city');
        Route::get('cities/{citySlug}/areas', [LocationController::class, 'areas'])->name('areas');
    });

    Route::prefix('services')->name('services.')->group(function (): void {
        Route::get('categories', [ServiceCategoryController::class, 'index'])->name('categories');
        Route::get('categories/{slug}', [ServiceCategoryController::class, 'show'])->name('category');
        Route::get('/', [ServiceCategoryController::class, 'services'])->name('index');
    });

    // -----------------------------------------------------------------
    // Authentication
    // -----------------------------------------------------------------

    Route::prefix('auth')->name('auth.')->group(function (): void {
        // Throttled hard: these are the endpoints worth attacking.
        Route::middleware('throttle:10,1')->group(function (): void {
            Route::post('register', [AuthController::class, 'register'])->name('register');
            Route::post('login', [AuthController::class, 'login'])->name('login');
            Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot');
            Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('reset');
        });

        // The signed link from the verification email. Unauthenticated by
        // design -- the signature is the credential -- and it redirects the
        // browser back to the frontend rather than returning JSON.
        Route::get('verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware(['signed', 'throttle:10,1'])
            ->name('verification.verify');

        Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::get('verification-status', [EmailVerificationController::class, 'status'])
                ->name('verification.status');
            Route::post('verify-email/resend', [EmailVerificationController::class, 'resend'])
                ->middleware('throttle:6,1')
                ->name('verification.send');
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('logout-all', [AuthController::class, 'logoutAll'])->name('logout.all');
            Route::get('devices', [AuthController::class, 'devices'])->name('devices');
            Route::delete('devices/{tokenId}', [AuthController::class, 'revokeDevice'])->name('devices.revoke');
        });
    });

    // -----------------------------------------------------------------
    // Authenticated
    //
    // Phase 1 establishes the shape. Properties, AI, bookings, quotes,
    // messaging, payments, reviews, maintenance and notifications land in
    // the phases that follow, each mounted here.
    // -----------------------------------------------------------------

    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        //
    });
});

// A request to an unknown /api path gets the standard envelope, not HTML.
Route::fallback(fn () => ApiResponse::notFound('That API endpoint does not exist.'));
