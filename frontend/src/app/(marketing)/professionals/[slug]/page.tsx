import type { Metadata } from 'next';
import { breadcrumbSchema, JsonLd } from '@/components/marketing/JsonLd';
import { ProfessionalView } from '@/components/marketing/views/ProfessionalView';
import { technicianApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, isShell, pageMetadata, SHELL, shellMetadata } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const listing = await safeFetch(
    () => technicianApi.list({ per_page: 48 }).then((r) => r.data),
    [],
    'professional slugs'
  );

  return [...listing.map((professional) => ({ slug: professional.slug })), { slug: SHELL }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  if (isShell(slug)) return shellMetadata();

  const data = await safeFetch(() => technicianApi.show(slug), null, `professional ${slug}`);

  if (!data) return pageMetadata({ title: 'Professional not found', path: `/professionals/${slug}`, noindex: true });

  const { professional } = data;
  const city = professional.city ? ` in ${professional.city.name}` : '';
  const trade = professional.categories[0]?.name ?? 'Home repair';

  return pageMetadata({
    title: `${professional.name} — ${trade}${city}`,
    description:
      professional.bio ??
      `${professional.name} is a PakFix verified ${trade.toLowerCase()} professional${city} with ${professional.completed_jobs_count} completed jobs.`,
    path: `/professionals/${slug}`,
    type: 'article',
  });
}

export default async function ProfessionalPage({ params }: Params) {
  const { slug } = await params;
  const initial = isShell(slug) ? null : await safeFetch(() => technicianApi.show(slug), null, `professional ${slug}`);

  return (
    <>
      {initial ? (
        <JsonLd
          data={[
            {
              // A tradesperson reachable through PakFix, not a shopfront:
              // no address or phone is published, by design.
              '@type': 'LocalBusiness',
              name: initial.professional.name,
              description: initial.professional.bio ?? undefined,
              url: absoluteUrl(`/professionals/${slug}`),
              areaServed: initial.professional.service_areas
                .map((area) => area.city)
                .filter(Boolean)
                .map((city) => ({ '@type': 'City', name: city })),
              ...(initial.professional.rating_count > 0
                ? {
                    aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: initial.professional.rating_average,
                      reviewCount: initial.professional.rating_count,
                      bestRating: 5,
                    },
                  }
                : {}),
            },
            breadcrumbSchema([
              { name: 'Home', url: absoluteUrl('/') },
              { name: 'Professionals', url: absoluteUrl('/find-a-technician') },
              { name: initial.professional.name, url: absoluteUrl(`/professionals/${slug}`) },
            ]),
          ]}
        />
      ) : null}

      <ProfessionalView slug={isShell(slug) ? null : slug} initial={initial} />
    </>
  );
}
