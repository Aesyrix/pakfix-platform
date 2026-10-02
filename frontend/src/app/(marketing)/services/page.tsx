import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { breadcrumbSchema, JsonLd } from '@/components/marketing/JsonLd';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { SiteSearchBox } from '@/components/marketing/SiteSearchBox';
import { catalogueApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Home Repair and Maintenance Services in Pakistan',
  description:
    'Plumbing, electrical, AC repair, appliances, pest control, painting and more. Browse every PakFix service, with typical prices and verified professionals.',
  path: '/services',
});

export default async function ServicesPage() {
  const categories = await safeFetch(() => catalogueApi.categories(), [], 'service tree');
  const emergency = categories.filter((category) => category.is_emergency);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'Services', url: absoluteUrl('/services') },
          ]),
          {
            '@type': 'ItemList',
            itemListElement: categories.map((category, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl(`/services/${category.slug}`),
              name: category.name,
            })),
          },
        ]}
      />

      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Services' }]}
        title="Every service, one place"
        subtitle="Prices shown are typical ranges across Pakistan. Your professional confirms the price before any work starts."
      >
        <SiteSearchBox placeholder="Search for a service, e.g. geyser, termites, CCTV" />
      </PageHeader>

      {emergency.length > 0 ? (
        <Section title="Emergency services" subtitle="For problems that cannot wait. PakFix raises these as high priority; it does not promise a fixed arrival time.">
          <ul className="flex flex-wrap gap-2">
            {emergency.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/services/${category.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-danger-500/40 bg-danger-500/10 px-4 text-sm font-semibold text-danger-600 hover:bg-danger-500/15"
                >
                  <CategoryIcon name={category.icon} className="h-4 w-4" />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="All services" muted>
        {categories.length === 0 ? (
          <EmptyState title="Services are being updated" description="The service list could not be loaded. Please try again shortly." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Card interactive className="relative h-full">
                  <CardBody className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                        <CategoryIcon name={category.icon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          <Link href={`/services/${category.slug}`} className="after:absolute after:inset-0 hover:text-brand-700">
                            {category.name}
                          </Link>
                        </h3>
                        {category.typical_price ? <p className="text-sm text-ink-500">{category.typical_price.display}</p> : null}
                      </div>
                    </div>
                    {category.description ? <p className="flex-1 text-sm text-ink-600">{category.description}</p> : null}
                    {category.children.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {category.children.slice(0, 4).map((child) => (
                          <Badge key={child.id} tone="neutral">
                            {child.name}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
