'use client';

import { useQuery, type QueryKey } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { SHELL } from '@/lib/seo';

/**
 * Public page data: rendered into the HTML at build time, then refreshed in
 * the browser.
 *
 * The build output is what search engines index. The refresh is what makes an
 * admin's edit visible to visitors straight away, without waiting for the
 * next build. `initialDataUpdatedAt: 0` marks the built copy as stale so the
 * refresh happens once on load.
 *
 * On a shell page (content created after the build) there is no built copy,
 * so the query simply loads it.
 */
export function usePublicData<T>(key: QueryKey, fetcher: () => Promise<T>, initial: T | null, enabled = true) {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    initialData: initial ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
    enabled,
    retry: (count, error) => !(error as { isNotFound?: boolean })?.isNotFound && count < 2,
  });
}

/**
 * The real slug for a page. A page built for real content receives its slug
 * directly; a shell page was built with a placeholder and reads the slug from
 * the URL the visitor actually requested.
 */
export function useResolvedSlug(slug: string | null, segmentIndex: number): string | null {
  const pathname = usePathname();

  if (slug && slug !== SHELL) return slug;

  const fromPath = pathname.split('/').filter(Boolean)[segmentIndex];

  return fromPath && fromPath !== SHELL ? decodeURIComponent(fromPath) : null;
}
