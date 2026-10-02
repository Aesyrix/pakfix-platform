import type { MetadataRoute } from 'next';
import { catalogueApi, locationApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';

/** Generated once at build time: the site is exported as static files. */
export const dynamic = 'force-static';


const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pakfix.pk').replace(/\/$/, '');

/**
 * Built from the live catalogue rather than a hand-written list, so a
 * category added in the admin dashboard is discoverable without a deploy.
 *
 * Only cities PakFix actually serves are listed: a landing page for a city
 * with no professionals is exactly the thin, duplicate content the brief
 * warns against.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, cities] = await Promise.all([
    safeFetch(() => catalogueApi.categories({ flat: true }), [], 'sitemap categories'),
    safeFetch(() => locationApi.cities(true), [], 'sitemap cities'),
  ]);

  const now = new Date();

  const staticPaths = [
    '', '/services', '/how-it-works', '/find-a-technician', '/become-a-technician',
    '/for-service-companies', '/for-property-managers', '/pricing', '/about',
    '/contact', '/blog', '/faq', '/safety', '/terms-of-service', '/privacy-policy',
    '/refund-policy',
  ];

  return [
    ...staticPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: (path === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: path === '' ? 1 : 0.7,
    })),

    ...categories.map((category) => ({
      url: `${siteUrl}/services/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...cities.map((city) => ({
      url: `${siteUrl}/${city.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
