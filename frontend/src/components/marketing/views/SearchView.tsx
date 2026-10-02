'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { FaqList, PostGrid, ProfessionalGrid } from '@/components/marketing/Cards';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { SiteSearchBox } from '@/components/marketing/SiteSearchBox';
import { searchApi } from '@/lib/api/endpoints';

export function SearchView() {
  const q = (useSearchParams().get('q') ?? '').trim();
  const enabled = q.length >= 2;

  const query = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchApi.search(q),
    enabled,
    staleTime: 60_000,
  });

  const results = query.data;
  const total = results
    ? results.categories.length + results.services.length + results.professionals.length + results.posts.length + results.faqs.length
    : 0;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Search' }]}
        title={enabled ? `Results for “${q}”` : 'Search PakFix'}
      >
        <SiteSearchBox key={q} defaultValue={q} />
      </PageHeader>

      {!enabled ? (
        <Container className="py-12">
          <EmptyState icon={<Search className="h-5 w-5" />} title="What are you looking for?" description="Type at least two letters: a service, a problem, or a professional's name." />
        </Container>
      ) : query.isPending ? (
        <Container className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Searching">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </Container>
      ) : query.isError ? (
        <Container className="py-12">
          <ErrorState description="Search is not available right now." onRetry={() => query.refetch()} />
        </Container>
      ) : total === 0 ? (
        <Container className="py-12">
          <EmptyState
            icon={<Search className="h-5 w-5" />}
            title="Nothing matched"
            description="Try a simpler word, or describe the problem and let PakFix suggest a service."
            action={
              <Link href={`/ai?q=${encodeURIComponent(q)}`} className="font-semibold text-brand-600 hover:text-brand-700">
                Describe “{q}” instead &rarr;
              </Link>
            }
          />
        </Container>
      ) : results ? (
        <>
          <p className="sr-only" role="status">
            {total} results
          </p>

          {results.categories.length > 0 || results.services.length > 0 ? (
            <Section title="Services">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.categories.map((category) => (
                  <li key={category.id}>
                    <Card interactive className="relative h-full">
                      <CardBody className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                          <CategoryIcon name={category.icon} className="h-5 w-5" />
                        </span>
                        <Link href={`/services/${category.slug}`} className="font-semibold after:absolute after:inset-0 hover:text-brand-700">
                          {category.name}
                        </Link>
                      </CardBody>
                    </Card>
                  </li>
                ))}
                {results.services.map((service) => (
                  <li key={service.id}>
                    <Card interactive className="relative h-full">
                      <CardBody>
                        <Link
                          href={`/services/${service.category?.slug ?? ''}`}
                          className="font-semibold after:absolute after:inset-0 hover:text-brand-700"
                        >
                          {service.name}
                        </Link>
                        <p className="mt-1 text-sm text-ink-500">
                          {service.category?.name} · {service.price_display}
                        </p>
                      </CardBody>
                    </Card>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {results.professionals.length > 0 ? (
            <Section title="Professionals" muted>
              <ProfessionalGrid professionals={results.professionals} />
            </Section>
          ) : null}

          {results.posts.length > 0 ? (
            <Section title="Guides">
              <PostGrid posts={results.posts} />
            </Section>
          ) : null}

          {results.faqs.length > 0 ? (
            <Section title="Questions" muted>
              <div className="max-w-3xl">
                <FaqList faqs={results.faqs} />
              </div>
            </Section>
          ) : null}
        </>
      ) : null}
    </>
  );
}
