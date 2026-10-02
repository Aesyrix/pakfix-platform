import type { NextConfig } from 'next';

/**
 * Two ways to run the website:
 *
 *  - Production (and `php pakfix start`): compiled to static files with
 *    PAKFIX_STATIC_EXPORT=1 and served by Laravel from backend/public, so the
 *    whole platform runs on PHP with no Node process on the server.
 *  - Frontend development: `npm run dev` on :3000 against the API on :8000,
 *    with hot reload.
 */
const staticExport = process.env.PAKFIX_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  output: staticExport ? 'export' : undefined,
  // /services, not /services/ -- matches Laravel's URL style and the
  // redirect in public/.htaccess.
  trailingSlash: false,
  images: {
    // Static export has no image optimisation server.
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
