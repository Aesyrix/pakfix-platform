import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/marketing/PageStates';
import { SearchView } from '@/components/marketing/views/SearchView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Search',
  description: 'Search PakFix services, professionals and home repair guides.',
  path: '/search',
  // Result pages are thin and endless; they add nothing to an index.
  noindex: true,
});

export default function SearchPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SearchView />
    </Suspense>
  );
}
