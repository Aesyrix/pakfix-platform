<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\LocalPageController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\Marketplace;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\ServiceCategoryController;
use App\Http\Controllers\Api\V1\TechnicianController;
use App\Http\Controllers\Api\V1\TriageController;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PakFix API, version 1
|--------------------------------------------------------------------------
| Every client -- the website, the future Android app, the future iOS app --
| talks to these routes. Nothing meaningful happens anywhere else, so
| shipping a mobile app later needs no new backend.
|
| Grouped by who may call them:
|   public     no authentication, cached, safe to hit from a crawler
|   auth       signed in, active account
|   admin      signed in, active, and holding the relevant permission
*/

Route::prefix('v1')->name('api.v1.')->group(function (): void {

    Route::get('/', fn () => ApiResponse::success([
        'name' => 'PakFix API',
        'version' => 'v1',
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

    Route::prefix('technicians')->name('technicians.')->group(function (): void {
        Route::get('/', [TechnicianController::class, 'index'])->name('index');
        Route::get('{slug}', [TechnicianController::class, 'show'])->name('show');
    });

    // Local SEO: /plumber/lahore and /lahore on the website.
    Route::prefix('local')->name('local.')->group(function (): void {
        Route::get('pages', [LocalPageController::class, 'index'])->name('index');
        Route::get('cities/{citySlug}', [LocalPageController::class, 'city'])->name('city');
        Route::get('{trade}/{citySlug}', [LocalPageController::class, 'show'])->name('show');
    });

    Route::prefix('blog')->name('blog.')->group(function (): void {
        Route::get('categories', [BlogController::class, 'categories'])->name('categories');
        Route::get('posts', [BlogController::class, 'index'])->name('posts');
        Route::get('posts/{slug}', [BlogController::class, 'show'])->name('post');
    });

    Route::get('search', SearchController::class)->middleware('throttle:60,1')->name('search');

    // Emergency screening and service matching. Throttled, because it is
    // public and does text processing on arbitrary input.
    Route::post('ai/triage', TriageController::class)->middleware('throttle:30,1')->name('ai.triage');

    Route::post('contact', ContactController::class)->middleware('throttle:5,10')->name('contact');

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
        // browser back to the website rather than returning JSON.
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
    // Marketplace — requests and bids
    //
    // Customers post a request and choose an offer; verified professionals
    // within reach bid on it. Ownership is checked in the controllers, so a
    // request or offer that is not yours answers 404.
    // -----------------------------------------------------------------

    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::middleware('permission:quotes.view.own')->group(function (): void {
            Route::get('requests', [Marketplace\CustomerRequestController::class, 'index'])->name('requests.index');
            Route::get('requests/{uuid}', [Marketplace\CustomerRequestController::class, 'show'])->name('requests.show');
        });

        Route::middleware(['permission:bookings.create', 'throttle:20,1'])->group(function (): void {
            Route::post('requests', [Marketplace\CustomerRequestController::class, 'store'])->name('requests.store');
            Route::post('requests/{uuid}/cancel', [Marketplace\CustomerRequestController::class, 'cancel'])->name('requests.cancel');
        });

        Route::middleware(['permission:quotes.respond', 'throttle:30,1'])->group(function (): void {
            Route::post('quotes/{uuid}/accept', [Marketplace\CustomerRequestController::class, 'accept'])->name('quotes.accept');
            Route::post('quotes/{uuid}/reject', [Marketplace\CustomerRequestController::class, 'reject'])->name('quotes.reject');
        });

        // Bookings: following and finishing a job once an offer is accepted.
        Route::middleware('permission:bookings.view.own')->group(function (): void {
            Route::get('bookings', [Marketplace\CustomerBookingController::class, 'index'])->name('bookings.index');
            Route::get('bookings/{uuid}', [Marketplace\CustomerBookingController::class, 'show'])->name('bookings.show');
        });
        Route::post('bookings/{uuid}/cancel', [Marketplace\CustomerBookingController::class, 'cancel'])
            ->middleware(['permission:bookings.cancel', 'throttle:20,1'])->name('bookings.cancel');
        Route::middleware(['permission:bookings.update', 'throttle:30,1'])->group(function (): void {
            Route::post('bookings/{uuid}/confirm', [Marketplace\CustomerBookingController::class, 'confirm'])->name('bookings.confirm');
            Route::post('bookings/{uuid}/revised-quote/accept', [Marketplace\CustomerBookingController::class, 'acceptQuote'])->name('bookings.quote.accept');
            Route::post('bookings/{uuid}/revised-quote/reject', [Marketplace\CustomerBookingController::class, 'rejectQuote'])->name('bookings.quote.reject');
            Route::post('bookings/{uuid}/review', [Marketplace\CustomerBookingController::class, 'review'])->name('bookings.review');
        });

        // A professional's own profile and verification (open while pending).
        // Deleting your own account (App Store / Play requirement).
        Route::get('account/deletion', [AccountController::class, 'deletionCheck'])->name('account.deletion');
        Route::delete('account', [AccountController::class, 'destroy'])->middleware('throttle:5,1,account')->name('account.destroy');

        // Booking chat: the customer and the professional on a job. Who you
        // are on the booking is checked in the service (anyone else: 404).
        Route::get('conversations', [Marketplace\ChatController::class, 'index'])->name('conversations.index');
        Route::get('conversations/unread', [Marketplace\ChatController::class, 'unread'])->name('conversations.unread');
        Route::get('bookings/{uuid}/messages', [Marketplace\ChatController::class, 'messages'])->name('bookings.messages');
        Route::get('bookings/{uuid}/messages/{id}/photo', [Marketplace\ChatController::class, 'photo'])->name('bookings.messages.photo');
        // Safety: report or block the other person on a job.
        Route::middleware('throttle:20,1,safety')->group(function (): void {
            Route::post('bookings/{uuid}/report', [Marketplace\SafetyController::class, 'report'])->name('bookings.report');
            Route::post('bookings/{uuid}/block', [Marketplace\SafetyController::class, 'block'])->name('bookings.block');
            Route::delete('bookings/{uuid}/block', [Marketplace\SafetyController::class, 'unblock'])->name('bookings.unblock');
            Route::delete('blocks/{userUuid}', [Marketplace\SafetyController::class, 'destroy'])->name('blocks.destroy');
        });
        Route::get('blocks', [Marketplace\SafetyController::class, 'index'])->name('blocks.index');
        Route::post('bookings/{uuid}/messages', [Marketplace\ChatController::class, 'store'])
            ->middleware('throttle:40,1,chat')->name('bookings.messages.store');

        Route::prefix('pro')->name('pro.')->middleware('permission:technicians.manage.own')->group(function (): void {
            Route::get('profile', [Marketplace\ProProfileController::class, 'show'])->name('profile.show');
            Route::put('profile', [Marketplace\ProProfileController::class, 'update'])->middleware('throttle:30,1')->name('profile.update');
            Route::post('verification/documents', [Marketplace\ProProfileController::class, 'upload'])->middleware('throttle:20,1')->name('verification.upload');
            Route::post('verification/submit', [Marketplace\ProProfileController::class, 'submit'])->middleware('throttle:10,1')->name('verification.submit');
        });

        Route::prefix('pro')->name('pro.')->group(function (): void {
            Route::middleware('permission:bookings.view.assigned')->group(function (): void {
                Route::get('bookings', [Marketplace\ProBookingController::class, 'index'])->name('bookings.index');
                Route::get('bookings/{uuid}', [Marketplace\ProBookingController::class, 'show'])->name('bookings.show');
            });
            Route::middleware(['permission:bookings.update.status', 'throttle:60,1'])->group(function (): void {
                Route::post('bookings/{uuid}/status', [Marketplace\ProBookingController::class, 'advance'])->name('bookings.status');
                Route::post('bookings/{uuid}/revised-quote', [Marketplace\ProBookingController::class, 'revisedQuote'])->name('bookings.quote');
                Route::post('bookings/{uuid}/cancel', [Marketplace\ProBookingController::class, 'cancel'])->name('bookings.cancel');
                Route::post('bookings/{uuid}/review-response', [Marketplace\ProBookingController::class, 'respondToReview'])
                    ->middleware('permission:reviews.respond')->name('bookings.review.respond');
            });
        });

        Route::prefix('pro')->name('pro.')->middleware('permission:quotes.create')->group(function (): void {
            Route::get('requests', [Marketplace\ProRequestController::class, 'nearby'])->name('requests.nearby');
            Route::get('requests/{uuid}', [Marketplace\ProRequestController::class, 'show'])->name('requests.show');
            Route::post('requests/{uuid}/quotes', [Marketplace\ProRequestController::class, 'quote'])
                ->middleware('throttle:30,1')->name('requests.quote');
            Route::get('quotes', [Marketplace\ProRequestController::class, 'myQuotes'])->name('quotes.index');
            Route::post('quotes/{uuid}/withdraw', [Marketplace\ProRequestController::class, 'withdraw'])->name('quotes.withdraw');
        });
    });

    // -----------------------------------------------------------------
    // Admin — content management
    //
    // Each group checks its own permission, so a support agent can work the
    // contact inbox without being able to rewrite the homepage.
    // -----------------------------------------------------------------

    Route::prefix('admin')->name('admin.')->middleware(['auth:sanctum', 'active'])->group(function (): void {

        Route::get('overview', Admin\OverviewController::class)
            ->middleware('permission:content.manage|blog.manage|services.manage|settings.manage|support.tickets.view.any')
            ->name('overview');

        Route::middleware('permission:content.manage')->group(function (): void {
            Route::get('content-blocks', [Admin\ContentBlockController::class, 'index'])->name('blocks.index');
            Route::patch('content-blocks/{key}', [Admin\ContentBlockController::class, 'update'])->name('blocks.update');

            Route::get('faqs', [Admin\FaqController::class, 'index'])->name('faqs.index');
            Route::post('faqs', [Admin\FaqController::class, 'store'])->name('faqs.store');
            Route::patch('faqs/{id}', [Admin\FaqController::class, 'update'])->whereNumber('id')->name('faqs.update');
            Route::delete('faqs/{id}', [Admin\FaqController::class, 'destroy'])->whereNumber('id')->name('faqs.destroy');

            Route::get('testimonials', [Admin\TestimonialController::class, 'index'])->name('testimonials.index');
            Route::post('testimonials', [Admin\TestimonialController::class, 'store'])->name('testimonials.store');
            Route::patch('testimonials/{id}', [Admin\TestimonialController::class, 'update'])->whereNumber('id')->name('testimonials.update');
            Route::delete('testimonials/{id}', [Admin\TestimonialController::class, 'destroy'])->whereNumber('id')->name('testimonials.destroy');

            Route::get('pages', [Admin\CmsPageController::class, 'index'])->name('pages.index');
            Route::post('pages', [Admin\CmsPageController::class, 'store'])->name('pages.store');
            Route::get('pages/{uuid}', [Admin\CmsPageController::class, 'show'])->name('pages.show');
            Route::patch('pages/{uuid}', [Admin\CmsPageController::class, 'update'])->name('pages.update');
            Route::delete('pages/{uuid}', [Admin\CmsPageController::class, 'destroy'])->name('pages.destroy');
        });

        Route::middleware('permission:blog.manage')->group(function (): void {
            Route::get('blog/options', [Admin\BlogPostController::class, 'options'])->name('blog.options');
            Route::get('blog/posts', [Admin\BlogPostController::class, 'index'])->name('blog.index');
            Route::post('blog/posts', [Admin\BlogPostController::class, 'store'])->name('blog.store');
            Route::get('blog/posts/{uuid}', [Admin\BlogPostController::class, 'show'])->name('blog.show');
            Route::patch('blog/posts/{uuid}', [Admin\BlogPostController::class, 'update'])->name('blog.update');
            Route::delete('blog/posts/{uuid}', [Admin\BlogPostController::class, 'destroy'])->name('blog.destroy');
        });

        Route::middleware('permission:services.manage')->group(function (): void {
            Route::get('service-categories', [Admin\ServiceCategoryController::class, 'index'])->name('categories.index');
            Route::post('service-categories', [Admin\ServiceCategoryController::class, 'store'])->name('categories.store');
            Route::patch('service-categories/{uuid}', [Admin\ServiceCategoryController::class, 'update'])->name('categories.update');
        });

        Route::middleware('permission:settings.manage')->group(function (): void {
            Route::get('settings', [Admin\SettingController::class, 'index'])->name('settings.index');
            Route::patch('settings', [Admin\SettingController::class, 'update'])->name('settings.update');
        });

        Route::middleware('permission:messages.moderate')->group(function (): void {
            Route::get('reports', [Admin\ReportController::class, 'index'])->name('reports.index');
            Route::patch('reports/{uuid}', [Admin\ReportController::class, 'update'])->name('reports.update');
        });

        Route::middleware('permission:technicians.verify')->group(function (): void {
            Route::get('verifications', [Admin\VerificationController::class, 'index'])->name('verifications.index');
            Route::get('verifications/{profile}', [Admin\VerificationController::class, 'show'])->name('verifications.show');
            Route::get('verifications/{profile}/documents/{id}', [Admin\VerificationController::class, 'document'])
                ->whereNumber('id')->name('verifications.document');
            Route::post('verifications/{profile}/approve', [Admin\VerificationController::class, 'approve'])->name('verifications.approve');
            Route::post('verifications/{profile}/reject', [Admin\VerificationController::class, 'reject'])->name('verifications.reject');
        });

        Route::middleware('permission:support.tickets.view.any')->group(function (): void {
            Route::get('contact-messages', [Admin\ContactMessageController::class, 'index'])->name('contact.index');
            Route::patch('contact-messages/{uuid}', [Admin\ContactMessageController::class, 'update'])->name('contact.update');
        });
    });
});

// A request to an unknown /api path gets the standard envelope, not HTML.
Route::fallback(fn () => ApiResponse::notFound('That API endpoint does not exist.'));
