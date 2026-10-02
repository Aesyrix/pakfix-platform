'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { SlidersHorizontal, UserSearch } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ProfessionalCard } from '@/components/marketing/Cards';
import { PageHeader } from '@/components/marketing/PageHeader';
import { technicianApi, type TechnicianFilters } from '@/lib/api/endpoints';
import type { City, ServiceCategory } from '@/lib/api/types';

const PER_PAGE = 12;

/**
 * The public directory. Filters live in the URL, so a filtered list can be
 * shared, bookmarked, and linked to from service and city pages.
 */
export function DirectoryView({ cities, categories }: { cities: City[]; categories: ServiceCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters: TechnicianFilters = {
    city: params.get('city') ?? undefined,
    category: params.get('category') ?? undefined,
    emergency: params.get('emergency') === '1',
    sort: (params.get('sort') as TechnicianFilters['sort']) ?? 'rating',
  };

  const query = useInfiniteQuery({
    queryKey: ['directory', filters],
    queryFn: ({ pageParam }) => technicianApi.list({ ...filters, page: pageParam, per_page: PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination?.has_more ? last.pagination.current_page + 1 : undefined),
    staleTime: 60_000,
  });

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());

    if (value) next.set(key, value);
    else next.delete(key);

    router.replace(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false });
  }

  const professionals = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.pagination?.total ?? null;
  const cityName = cities.find((city) => city.slug === filters.city)?.name;
  const categoryName = categories.find((category) => category.slug === filters.category)?.name;

  const heading = [categoryName ? `${categoryName} professionals` : 'Verified professionals', cityName ? `in ${cityName}` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Find a professional' }]}
        title={heading}
        subtitle="Every professional listed here has had their identity checked by the PakFix team. Contact details stay private; you reach them through PakFix."
      />

      <Container className="py-8">
        <form
          className="grid gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Filter professionals"
          onSubmit={(event) => event.preventDefault()}
        >
          <Select label="Service" value={filters.category ?? ''} onChange={(event) => update('category', event.target.value || null)}>
            <option value="">All services</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select label="City" value={filters.city ?? ''} onChange={(event) => update('city', event.target.value || null)}>
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </Select>

          <Select label="Sort by" value={filters.sort} onChange={(event) => update('sort', event.target.value === 'rating' ? null : event.target.value)}>
            <option value="rating">Highest rated</option>
            <option value="jobs">Most jobs completed</option>
            <option value="experience">Most experience</option>
          </Select>

          <label className="flex min-h-12 cursor-pointer items-center gap-3 self-end rounded-[var(--radius-control)] border border-[var(--border)] px-3.5">
            <input
              type="checkbox"
              checked={filters.emergency}
              onChange={(event) => update('emergency', event.target.checked ? '1' : null)}
              className="h-5 w-5 accent-[var(--color-brand-600)]"
            />
            <span className="text-sm font-medium">Emergency call-outs only</span>
          </label>
        </form>

        <div className="mt-6" aria-live="polite">
          {query.isPending ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading professionals">
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index}>
                  <SkeletonCard />
                </li>
              ))}
            </ul>
          ) : query.isError ? (
            <ErrorState description="The directory could not be loaded." onRetry={() => query.refetch()} />
          ) : professionals.length === 0 ? (
            <EmptyState
              icon={<UserSearch className="h-5 w-5" />}
              title="No professionals match these filters yet"
              description="We are onboarding verified professionals city by city. Try another city or service, or clear the filters."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="secondary" onClick={() => router.replace(pathname)}>
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Clear filters
                  </Button>
                  <ButtonLink href="/become-a-technician">Join as a professional</ButtonLink>
                </div>
              }
            />
          ) : (
            <>
              {total !== null ? (
                <p className="mb-4 text-sm text-ink-500">
                  {total} {total === 1 ? 'professional' : 'professionals'}
                </p>
              ) : null}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {professionals.map((professional) => (
                  <li key={professional.id} className="relative">
                    <ProfessionalCard professional={professional} />
                  </li>
                ))}
              </ul>
              {query.hasNextPage ? (
                <div className="mt-8 flex justify-center">
                  <Button variant="secondary" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
                    Show more
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Container>
    </>
  );
}
