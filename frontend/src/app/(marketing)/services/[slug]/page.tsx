import type { Metadata } from 'next';
import { breadcrumbSchema, faqSchema, JsonLd } from '@/components/marketing/JsonLd';
import { ServicePageView } from '@/components/marketing/views/ServicePageView';
import { catalogueApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, isShell, pageMetadata, SHELL, shellMetadata } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

// Only the pages generated below exist; unknown slugs are resolved by the PHP
// server, which serves the shell page for services created after the build.
export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await safeFetch(() => catalogueApi.categories({ flat: true }), [], 'service slugs');

  return [...categories.map((category) => ({ slug: category.slug })), { slug: SHELL }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  if (isShell(slug)) return shellMetadata();

  const data = await safeFetch(() => catalogueApi.category(slug), null, `service ${slug}`);

  if (!data) return pageMetadata({ title: 'Service not found', path: `/services/${slug}`, noindex: true });

  return pageMetadata({
    title: data.category.seo.title ?? `${data.category.name} Services in Pakistan`,
    description:
      data.category.seo.description ??
      data.category.description ??
      `Book a verified ${data.category.name.toLowerCase()} professional with PakFix.`,
    path: `/services/${slug}`,
  });
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const initial = isShell(slug) ? null : await safeFetch(() => catalogueApi.category(slug), null, `service ${slug}`);

  return (
    <>
      {initial ? (
        <JsonLd
          data={[
            {
              '@type': 'Service',
              name: initial.category.name,
              description: initial.category.description ?? undefined,
              serviceType: initial.category.name,
              provider: { '@type': 'Organization', name: 'PakFix', url: absoluteUrl('/') },
              areaServed: initial.cities.map((city) => ({ '@type': 'City', name: city.name })),
              ...(initial.category.typical_price
                ? {
                    offers: {
                      '@type': 'AggregateOffer',
                      priceCurrency: 'PKR',
                      lowPrice: initial.category.typical_price.min_minor / 100,
                      highPrice: (initial.category.typical_price.max_minor ?? initial.category.typical_price.min_minor) / 100,
                    },
                  }
                : {}),
            },
            breadcrumbSchema([
              { name: 'Home', url: absoluteUrl('/') },
              { name: 'Services', url: absoluteUrl('/services') },
              { name: initial.category.name, url: absoluteUrl(`/services/${slug}`) },
            ]),
            ...(faqSchema(initial.faqs) ? [faqSchema(initial.faqs) as Record<string, unknown>] : []),
          ]}
        />
      ) : null}

      <ServicePageView slug={isShell(slug) ? null : slug} initial={initial} />
    </>
  );
}
