import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchView, SearchViewFromUrl } from '@/components/marketing/views/SearchView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Search',
  description: 'Search PakFix services, professionals and repair guides.',
  path: '/search',
  // Result pages are thin and endless; they add nothing to an index.
  noindex: true,
});

export default function SearchPage() {
  // The built page is the empty search, so it shows at once; the browser
  // then runs the query from the URL (?q=).
  return (
    <Suspense fallback={<SearchView />}>
      <SearchViewFromUrl />
    </Suspense>
  );
}
