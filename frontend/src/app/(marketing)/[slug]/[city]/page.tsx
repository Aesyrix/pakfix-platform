import type { Metadata } from 'next';
import { breadcrumbSchema, faqSchema, JsonLd } from '@/components/marketing/JsonLd';
import { LocalPageView } from '@/components/marketing/views/LocalPageView';
import { localApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, isShell, pageMetadata, SHELL, shellMetadata } from '@/lib/seo';

type Params = { params: Promise<{ slug: string; city: string }> };

/**
 * Local SEO pages: /plumber/lahore, /ac-repair/karachi.
 *
 * The API decides which of these exist -- a combination is only a page when
 * verified professionals actually cover that service in that city -- so the
 * site cannot generate pages promising work nobody can do.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await safeFetch(() => localApi.pages(), [], 'local page combinations');

  return [
    ...pages.map((page) => ({ slug: page.trade_slug, city: page.city_slug })),
    { slug: SHELL, city: SHELL },
  ];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, city } = await params;

  if (isShell(slug) || isShell(city)) return shellMetadata();

  const data = await safeFetch(() => localApi.page(slug, city), null, `local page ${slug}/${city}`);

  if (!data) return pageMetadata({ title: 'Not available', path: `/${slug}/${city}`, noindex: true });

  return pageMetadata({
    title: `${data.trade.name} in ${data.city.name} | Verified Professionals`,
    description: `Book a verified ${data.trade.name.toLowerCase()} in ${data.city.name}. ${data.professional_count} identity-checked ${data.professional_count === 1 ? 'professional' : 'professionals'}, typical prices shown, price agreed before work starts.`,
    path: `/${slug}/${city}`,
  });
}

export default async function LocalPage({ params }: Params) {
  const { slug, city } = await params;
  const shell = isShell(slug) || isShell(city);
  const initial = shell ? null : await safeFetch(() => localApi.page(slug, city), null, `local page ${slug}/${city}`);

  return (
    <>
      {initial ? (
        <JsonLd
          data={[
            {
              '@type': 'Service',
              name: `${initial.trade.name} in ${initial.city.name}`,
              serviceType: initial.category.name,
              provider: { '@type': 'Organization', name: 'PakFix', url: absoluteUrl('/') },
              areaServed: { '@type': 'City', name: initial.city.name },
              ...(initial.category.typical_price
                ? {
                    offers: {
                      '@type': 'AggregateOffer',
                      priceCurrency: 'PKR',
                      lowPrice: initial.category.typical_price.min_minor / 100,
                      highPrice:
                        (initial.category.typical_price.max_minor ?? initial.category.typical_price.min_minor) / 100,
                      offerCount: initial.professional_count,
                    },
                  }
                : {}),
            },
            breadcrumbSchema([
              { name: 'Home', url: absoluteUrl('/') },
              { name: initial.city.name, url: absoluteUrl(`/${initial.city.slug}`) },
              { name: initial.trade.name, url: absoluteUrl(`/${slug}/${city}`) },
            ]),
            ...(faqSchema(initial.faqs) ? [faqSchema(initial.faqs) as Record<string, unknown>] : []),
          ]}
        />
      ) : null}

      <LocalPageView trade={shell ? null : slug} city={shell ? null : city} initial={initial} />
    </>
  );
}
