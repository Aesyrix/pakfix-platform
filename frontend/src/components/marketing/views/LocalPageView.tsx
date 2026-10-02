'use client';

import { ArrowRight, MapPin, ShieldCheck, Sparkles, Star, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { FaqList, LinkPills, PostGrid, ProfessionalGrid, ReviewList } from '@/components/marketing/Cards';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { PageLoadError, PageSkeleton } from '@/components/marketing/PageStates';
import { usePublicData, useResolvedSlug } from '@/hooks/usePublicData';
import { localApi } from '@/lib/api/endpoints';
import type { LocalPagePayload } from '@/lib/api/types';

/**
 * A local SEO page such as /plumber/lahore.
 *
 * Every number and name on this page comes from that city's own
 * professionals, areas and reviews, so no two of these pages are the same
 * text with a city name swapped in.
 */
export function LocalPageView({
  trade: builtTrade,
  city: builtCity,
  initial,
}: {
  trade: string | null;
  city: string | null;
  initial: LocalPagePayload | null;
}) {
  const trade = useResolvedSlug(builtTrade, 0);
  const city = useResolvedSlug(builtCity, 1);

  const query = usePublicData(
    ['local-page', trade, city],
    () => localApi.page(trade as string, city as string),
    initial,
    Boolean(trade && city)
  );

  if (!query.data) {
    return query.isError ? (
      <PageLoadError
        error={query.error}
        onRetry={() => query.refetch()}
        notFoundTitle="We do not cover that service there yet"
        notFoundDescription="PakFix only lists a service in a city once verified professionals actually cover it."
      />
    ) : (
      <PageSkeleton />
    );
  }

  const data = query.data;
  const tradeName = data.trade.name;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: data.city.name, href: `/${data.city.slug}` },
          { name: tradeName },
        ]}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone="verified">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {data.professional_count} verified {data.professional_count === 1 ? 'professional' : 'professionals'}
            </Badge>
            {data.average_rating > 0 ? (
              <Badge tone="accent">
                <Star className="h-3 w-3" aria-hidden="true" />
                {data.average_rating.toFixed(1)} average rating
              </Badge>
            ) : null}
            {data.category.typical_price ? <Badge tone="neutral">Typically {data.category.typical_price.display}</Badge> : null}
          </span>
        }
        title={`${tradeName} in ${data.city.name}`}
        subtitle={`Book an identity-checked ${tradeName.toLowerCase()} covering ${data.city.name}. You see the price before any work starts, and every job stays on your home's record.`}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/ai?q=${encodeURIComponent(`${data.category.name} problem in ${data.city.name}`)}`} size="lg">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Describe my problem
          </ButtonLink>
          <ButtonLink
            href={`/find-a-technician?category=${data.category.slug}&city=${data.city.slug}`}
            variant="secondary"
            size="lg"
          >
            Compare {data.professional_count} {data.professional_count === 1 ? 'professional' : 'professionals'}
          </ButtonLink>
        </div>
      </PageHeader>

      {data.common_problems.length > 0 ? (
        <Section title={`What a ${tradeName.toLowerCase()} in ${data.city.name} is called out for`}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.common_problems.map((problem) => (
              <li key={problem}>
                <Link
                  href={`/ai?q=${encodeURIComponent(problem)}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-surface px-4 py-3 text-sm font-medium transition-colors hover:border-[#00824A]"
                >
                  <span className="flex items-center gap-3">
                    <Wrench className="h-4 w-4 shrink-0 text-[#00824A]" aria-hidden="true" />
                    {problem}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title={`${tradeName}s available in ${data.city.name}`} muted>
        <ProfessionalGrid professionals={data.professionals} />
      </Section>

      {data.category.services.length > 0 ? (
        <Section title="Typical jobs and prices">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.category.services.map((service) => (
              <li key={service.id}>
                <Card className="h-full">
                  <CardBody className="flex h-full flex-col gap-2">
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.description ? <p className="text-sm text-ink-600">{service.description}</p> : null}
                    <p className="mt-auto pt-3 text-lg font-bold">{service.price_display}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-500">
            Prices are typical for {data.city.name}. Your professional confirms the price before starting.
          </p>
        </Section>
      ) : null}

      {data.reviews.length > 0 ? (
        <Section title={`What ${data.city.name} customers said`} muted>
          <ReviewList reviews={data.reviews} />
        </Section>
      ) : null}

      {data.areas.length > 0 ? (
        <Section title={`Areas covered in ${data.city.name}`}>
          <ul className="flex flex-wrap gap-2">
            {data.areas.map((area) => (
              <li
                key={area.id}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-surface px-3.5 text-sm text-ink-600"
              >
                <MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
                {area.name}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {data.faqs.length > 0 ? (
        <Section title={`${tradeName} questions`} muted>
          <div className="max-w-3xl">
            <FaqList faqs={data.faqs} />
          </div>
        </Section>
      ) : null}

      {data.related_posts.length > 0 ? (
        <Section title="Guides">
          <PostGrid posts={data.related_posts} />
        </Section>
      ) : null}

      {data.same_trade_other_cities.length > 0 || data.other_trades_in_city.length > 0 ? (
        <Section muted>
          <div className="grid gap-8 md:grid-cols-2">
            {data.same_trade_other_cities.length > 0 ? (
              <div>
                <h2 className="mb-3 text-lg font-semibold">{tradeName} in other cities</h2>
                <LinkPills links={data.same_trade_other_cities} label={`${tradeName} in other cities`} />
              </div>
            ) : null}
            {data.other_trades_in_city.length > 0 ? (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Other services in {data.city.name}</h2>
                <LinkPills links={data.other_trades_in_city} label={`Other services in ${data.city.name}`} />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}
    </>
  );
}
