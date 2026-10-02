import type { MetadataRoute } from 'next';

/** Generated once at build time: the site is exported as static files. */
export const dynamic = 'force-static';


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pakfix.pk';

/**
 * Anything behind a login is kept out of the index: those pages are useless
 * to a searcher and a crawler hitting them only wastes crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/pro', '/admin', '/login', '/register', '/reset-password', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
