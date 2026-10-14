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
import { useT } from '@/components/i18n/LocaleProvider';
import { technicianApi, type TechnicianFilters } from '@/lib/api/endpoints';
import type { City, ServiceCategory } from '@/lib/api/types';

const PER_PAGE = 12;

/**
 * The public directory. Filters live in the URL, so a filtered list can be
 * shared, bookmarked, and linked to from service and city pages.
 */
export function DirectoryView({ cities, categories }: { cities: City[]; categories: ServiceCategory[] }) {
  const t = useT();
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

  const heading = [
    categoryName ? t(`${categoryName} professionals`, `${categoryName} پروفیشنلز`) : t('Verified professionals', 'تصدیق شدہ پروفیشنلز'),
    cityName ? t(`in ${cityName}`, `${cityName} میں`) : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Find a professional', 'پروفیشنل تلاش کریں') }]}
        title={heading}
        subtitle={t('Every professional listed here has had their identity checked by the PakFix team. Contact details stay private; you reach them through PakFix.', 'یہاں درج ہر پروفیشنل کی شناخت پاک فکس ٹیم نے جانچی ہے۔ رابطے کی تفصیلات نجی رہتی ہیں؛ آپ پاک فکس کے ذریعے ان تک پہنچتے ہیں۔')}
      />

      <Container className="py-8">
        <form
          className="grid gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label={t('Filter professionals', 'پروفیشنلز فلٹر کریں')}
          onSubmit={(event) => event.preventDefault()}
        >
          <Select label={t('Service', 'سروس')} value={filters.category ?? ''} onChange={(event) => update('category', event.target.value || null)}>
            <option value="">{t('All services', 'تمام خدمات')}</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select label={t('City', 'شہر')} value={filters.city ?? ''} onChange={(event) => update('city', event.target.value || null)}>
            <option value="">{t('All cities', 'تمام شہر')}</option>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </Select>

          <Select label={t('Sort by', 'ترتیب')} value={filters.sort} onChange={(event) => update('sort', event.target.value === 'rating' ? null : event.target.value)}>
            <option value="rating">{t('Highest rated', 'سب سے زیادہ ریٹنگ')}</option>
            <option value="jobs">{t('Most jobs completed', 'سب سے زیادہ مکمل کام')}</option>
            <option value="experience">{t('Most experience', 'سب سے زیادہ تجربہ')}</option>
          </Select>

          <label className="flex min-h-12 cursor-pointer items-center gap-3 self-end rounded-[var(--radius-control)] border border-[var(--border)] px-3.5">
            <input
              type="checkbox"
              checked={filters.emergency}
              onChange={(event) => update('emergency', event.target.checked ? '1' : null)}
              className="h-5 w-5 accent-[var(--color-brand-600)]"
            />
            <span className="text-sm font-medium">{t('Emergency call-outs only', 'صرف ہنگامی کال آؤٹ')}</span>
          </label>
        </form>

        <div className="mt-6" aria-live="polite">
          {query.isPending ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={t('Loading professionals', 'پروفیشنلز لوڈ ہو رہے ہیں')}>
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index}>
                  <SkeletonCard />
                </li>
              ))}
            </ul>
          ) : query.isError ? (
            <ErrorState description={t('The directory could not be loaded.', 'ڈائریکٹری لوڈ نہیں ہو سکی۔')} onRetry={() => query.refetch()} />
          ) : professionals.length === 0 ? (
            <EmptyState
              icon={<UserSearch className="h-5 w-5" />}
              title={t('No professionals match these filters yet', 'ابھی ان فلٹرز سے کوئی پروفیشنل مطابقت نہیں رکھتا')}
              description={t('We are onboarding verified professionals city by city. Try another city or service, or clear the filters.', 'ہم شہر بہ شہر تصدیق شدہ پروفیشنلز شامل کر رہے ہیں۔ کوئی دوسرا شہر یا سروس آزمائیں، یا فلٹرز ہٹا دیں۔')}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="secondary" onClick={() => router.replace(pathname)}>
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    {t('Clear filters', 'فلٹرز صاف کریں')}
                  </Button>
                  <ButtonLink href="/become-a-technician">{t('Join as a professional', 'پروفیشنل کے طور پر شامل ہوں')}</ButtonLink>
                </div>
              }
            />
          ) : (
            <>
              {total !== null ? (
                <p className="mb-4 text-sm text-ink-500">
                  {t(`${total} ${total === 1 ? 'professional' : 'professionals'}`, `${total} ${total === 1 ? 'پروفیشنل' : 'پروفیشنلز'}`)}
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
                    {t('Show more', 'مزید دکھائیں')}
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
