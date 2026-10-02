<?php

declare(strict_types=1);

namespace App\Support;

/**
 * First URL segments the site already uses.
 *
 * Local SEO pages live at the root (/plumber/lahore, /lahore), so a trade
 * slug or city slug that collided with one of these would silently shadow a
 * real page. Admin input is validated against this list.
 */
final class ReservedPaths
{
    public const SEGMENTS = [
        '_next', 'about', 'admin', 'ai', 'api', 'become-a-technician', 'blog',
        'contact', 'dashboard', 'faq', 'find-a-technician', 'for-property-managers',
        'for-service-companies', 'forgot-password', 'how-it-works', 'icons', 'login',
        'manifest.webmanifest', 'pages', 'pricing', 'privacy-policy', 'pro', 'professionals',
        'refund-policy', 'register', 'reset-password', 'robots.txt', 'safety',
        'sanctum', 'search', 'services', 'sitemap.xml', 'storage', 'terms-of-service',
        'up', 'verify-email',
    ];

    public static function isReserved(string $segment): bool
    {
        return in_array(strtolower($segment), self::SEGMENTS, true);
    }
}
