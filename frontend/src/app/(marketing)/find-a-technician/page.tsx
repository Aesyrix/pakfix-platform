import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DirectoryView, DirectoryViewFromUrl } from '@/components/marketing/views/DirectoryView';
import { catalogueApi, locationApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Find a Verified Repair Professional',
  description:
    'Compare verified plumbers, electricians, AC technicians and more across Pakistan by rating, experience and visit fee.',
  path: '/find-a-technician',
});

export default async function FindATechnicianPage() {
  const [cities, categories] = await Promise.all([
    safeFetch(() => locationApi.cities(true), [], 'served cities'),
    safeFetch(() => catalogueApi.categories(), [], 'categories'),
  ]);

  // The built page is the unfiltered directory, so it shows at once; the
  // browser then applies any filters in the URL.
  return (
    <Suspense fallback={<DirectoryView cities={cities} categories={categories} />}>
      <DirectoryViewFromUrl cities={cities} categories={categories} />
    </Suspense>
  );
}
