<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| PakFix platform configuration
|--------------------------------------------------------------------------
| Business rules that operations may want to change. Anything an admin can
| edit from the dashboard lives in the `settings` table and falls back to
| the values here — see App\Services\Settings\SettingsRepository.
*/

return [

    'brand' => [
        'name' => 'PakFix',
        'domain' => 'pakfix.pk',
        'tagline' => 'Show the Problem. Get It Fixed.',
        'support_email' => env('SUPPORT_EMAIL', 'support@pakfix.pk'),
        'support_phone' => env('SUPPORT_PHONE', '+92 300 0000000'),
        'whatsapp' => env('SUPPORT_WHATSAPP', ''),
    ],

    'currency' => [
        // Architecture supports more; PKR is the only one enabled today.
        'default' => 'PKR',
        'supported' => ['PKR'],
        'symbol' => 'Rs',
        // Money is stored as integer minor units everywhere. PKR has no
        // circulating subunit, but keeping the scale avoids float drift
        // and leaves room for currencies that do.
        'minor_units' => 100,
    ],

    'booking' => [
        // Human reference printed on invoices: PF-2026-000125
        'reference_prefix' => 'PF',
        'max_open_per_customer' => 10,
        'cancellation_window_minutes' => 60,
        'auto_confirm_after_hours' => 48,
    ],

    'commission' => [
        // Fallback only. Category / technician / company overrides live in
        // the `commissions` table and are resolved most-specific-first.
        'type' => 'percentage',          // percentage | flat
        'percentage' => (float) env('PLATFORM_COMMISSION_PERCENT', 10),
        'flat_minor' => 0,
        'tax_percentage' => (float) env('PLATFORM_TAX_PERCENT', 0),
    ],

    'matching' => [
        // Every weight is configurable; the matcher normalises them.
        'default_radius_km' => 15,
        'max_radius_km' => 50,
        'max_candidates' => 25,
        'weights' => [
            'distance' => 0.30,
            'rating' => 0.25,
            'completion_rate' => 0.15,
            'response_time' => 0.15,
            'verification' => 0.10,
            'price' => 0.05,
        ],
    ],

    'uploads' => [
        'image_mimes' => ['jpg', 'jpeg', 'png', 'webp'],
        'video_mimes' => ['mp4', 'webm', 'mov'],
        'document_mimes' => ['pdf'],
        'max_image_kb' => (int) env('UPLOAD_MAX_IMAGE_KB', 8192),
        'max_video_kb' => (int) env('UPLOAD_MAX_VIDEO_KB', 51200),
        'max_document_kb' => (int) env('UPLOAD_MAX_DOCUMENT_KB', 10240),
        'disk' => env('FILESYSTEM_DISK', 'local'),
        // Signed-URL lifetime for private documents (CNIC, invoices).
        'private_url_minutes' => 10,
    ],

    'maps' => [
        'key' => env('GOOGLE_MAPS_KEY'),
        'places_key' => env('GOOGLE_PLACES_KEY', env('GOOGLE_MAPS_KEY')),
        'geocoding_key' => env('GOOGLE_GEOCODING_KEY', env('GOOGLE_MAPS_KEY')),
        'distance_matrix_key' => env('GOOGLE_DISTANCE_MATRIX_KEY', env('GOOGLE_MAPS_KEY')),
    ],

    'notifications' => [
        'channels' => [
            'database' => true,
            'mail' => true,
            'sms' => env('SMS_ENABLED', false),
            'whatsapp' => env('WHATSAPP_ENABLED', false),
            'push' => env('PUSH_ENABLED', false),
        ],
    ],

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
