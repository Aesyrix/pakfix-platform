import type { Metadata } from 'next';
import { breadcrumbSchema, JsonLd } from '@/components/marketing/JsonLd';
import { catalogueApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { ServicesContent } from './ServicesContent';

export const metadata: Metadata = pageMetadata({
  title: 'Home Repair and Maintenance Services in Pakistan',
  description:
    'Plumbing, electrical, AC repair, appliances, pest control, painting and more. Browse every PakFix service, with typical prices and verified professionals.',
  path: '/services',
});

export default async function ServicesPage() {
  const categories = await safeFetch(() => catalogueApi.categories(), [], 'service tree');

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

      <ServicesContent categories={categories} />
    </>
  );
}
