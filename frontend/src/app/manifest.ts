import type { MetadataRoute } from 'next';

/** Generated once at build time: the site is exported as static files. */
export const dynamic = 'force-static';


/**
 * PWA manifest.
 *
 * PakFix ships as an installable web app before the native ones exist, so a
 * customer on a phone can add it to their home screen and get an app icon,
 * no browser chrome and a launch screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PakFix — Home Repair & Maintenance',
    short_name: 'PakFix',
    description:
      'Diagnose a home problem, book a verified professional, and keep a maintenance record of your property.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0f766e',
    lang: 'en-PK',
    dir: 'ltr',
    categories: ['utilities', 'lifestyle', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Ask PakFix AI', short_name: 'Ask AI', url: '/ai' },
      { name: 'My bookings', short_name: 'Bookings', url: '/dashboard/bookings' },
    ],
  };
}
