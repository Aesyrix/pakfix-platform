import type { Metadata } from 'next';
import { breadcrumbSchema, faqSchema, JsonLd } from '@/components/marketing/JsonLd';
import { CityView } from '@/components/marketing/views/CityView';
import { localApi, locationApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, isShell, pageMetadata, SHELL, shellMetadata } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

/**
 * City landing pages at the root: /lahore, /karachi.
 *
 * Only cities PakFix has actually launched in are generated. Every static
 * route in this folder (/about, /blog, /services …) takes precedence over
 * this one, so a city can never shadow a real page.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const cities = await safeFetch(() => locationApi.cities(true), [], 'served city slugs');

  return [...cities.map((city) => ({ slug: city.slug })), { slug: SHELL }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  if (isShell(slug)) return shellMetadata();

  const data = await safeFetch(() => localApi.city(slug), null, `city ${slug}`);

  if (!data) return pageMetadata({ title: 'City not found', path: `/${slug}`, noindex: true });

  return pageMetadata({
    title: `Home Repair Services in ${data.city.name}`,
    description: `Book verified plumbers, electricians, AC technicians and more in ${data.city.name}. ${data.professional_count} identity-checked professionals on PakFix.`,
    path: `/${slug}`,
  });
}

export default async function CityPage({ params }: Params) {
  const { slug } = await params;
  const initial = isShell(slug) ? null : await safeFetch(() => localApi.city(slug), null, `city ${slug}`);

  return (
    <>
      {initial ? (
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: 'Home', url: absoluteUrl('/') },
              { name: initial.city.name, url: absoluteUrl(`/${slug}`) },
            ]),
            {
              '@type': 'Service',
              name: `Home repair and maintenance in ${initial.city.name}`,
              provider: { '@type': 'Organization', name: 'PakFix', url: absoluteUrl('/') },
              areaServed: { '@type': 'City', name: initial.city.name },
            },
            ...(faqSchema(initial.faqs) ? [faqSchema(initial.faqs) as Record<string, unknown>] : []),
          ]}
        />
      ) : null}

      <CityView slug={isShell(slug) ? null : slug} initial={initial} />
    </>
  );
}
