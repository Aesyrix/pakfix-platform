'use client';

import { ArrowRight, CircleCheck, MapPin, Siren, Sparkles, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { FaqList, PostGrid, ProfessionalGrid } from '@/components/marketing/Cards';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { PageLoadError, PageSkeleton } from '@/components/marketing/PageStates';
import { usePublicData, useResolvedSlug } from '@/hooks/usePublicData';
import { catalogueApi } from '@/lib/api/endpoints';
import type { ServicePagePayload } from '@/lib/api/types';
import { formatDuration } from '@/lib/utils/money';

export function ServicePageView({ slug: builtSlug, initial }: { slug: string | null; initial: ServicePagePayload | null }) {
  const slug = useResolvedSlug(builtSlug, 1);
  const query = usePublicData(['service-page', slug], () => catalogueApi.category(slug as string), initial, Boolean(slug));

  if (!query.data) {
    return query.isError ? (
      <PageLoadError error={query.error} onRetry={() => query.refetch()} notFoundTitle="That service is not available" />
    ) : (
      <PageSkeleton />
    );
  }

  const { category, parent, trade, common_problems, faqs, cities, professionals, related_posts } = query.data;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Services', href: '/services' },
          ...(parent ? [{ name: parent.name, href: `/services/${parent.slug}` }] : []),
          { name: category.name },
        ]}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-brand-600 text-white">
              <CategoryIcon name={category.icon} className="h-5 w-5" />
            </span>
            {category.is_emergency ? (
              <Badge tone="danger">
                <Siren className="h-3 w-3" aria-hidden="true" />
                Emergency call-outs available
              </Badge>
            ) : null}
            {category.typical_price ? <Badge tone="accent">Typically {category.typical_price.display}</Badge> : null}
          </span>
        }
        title={`${category.name} services`}
        subtitle={category.description}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/ai?q=${encodeURIComponent(`${category.name} problem`)}`} size="lg">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Describe my problem
          </ButtonLink>
          <ButtonLink href={`/find-a-technician?category=${category.slug}`} variant="secondary" size="lg">
            Find a {trade?.name ?? 'professional'}
          </ButtonLink>
        </div>
      </PageHeader>

      {common_problems.length > 0 ? (
        <Section title="Common problems we fix" subtitle="Tap a problem to get a safety check and the right professional.">
          <ul className="grid gap-3 sm:grid-cols-2">
            {common_problems.map((problem) => (
              <li key={problem}>
                <Link
                  href={`/ai?q=${encodeURIComponent(problem)}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-surface px-4 py-3 text-sm font-medium transition-colors hover:border-brand-400"
                >
                  <span className="flex items-center gap-3">
                    <Wrench className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {problem}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {category.services.length > 0 || category.children.length > 0 ? (
        <Section title="Services and prices" subtitle="Fixed prices are what you pay for that job. Everything else is quoted after inspection, before work starts." muted>
          {category.services.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => (
                <li key={service.id}>
                  <Card className="h-full">
                    <CardBody className="flex h-full flex-col gap-2">
                      <h3 className="text-base font-semibold">{service.name}</h3>
                      {service.description ? <p className="text-sm text-ink-600">{service.description}</p> : null}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                        <span className="text-lg font-bold text-foreground">{service.price_display}</span>
                        {service.estimated_minutes ? (
                          <span className="text-xs text-ink-500">About {formatDuration(service.estimated_minutes)}</span>
                        ) : null}
                      </div>
                      {service.pricing_model === 'visit_fee' ? (
                        <p className="text-xs text-ink-500">Inspection visit; repair quoted on site.</p>
                      ) : null}
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          ) : null}

          {category.children.length > 0 ? (
            <div className={category.services.length > 0 ? 'mt-8' : undefined}>
              <h3 className="mb-3 text-base font-semibold">Specialist services</h3>
              <ul className="flex flex-wrap gap-2">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/services/${child.slug}`}
                      className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--border)] bg-background px-4 text-sm font-medium hover:border-brand-400 hover:text-brand-700"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>
      ) : null}

      <Section title="How booking works">
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ['Tell us what is wrong', 'Describe the problem or send a photo. Dangerous problems are flagged straight away.'],
            ['Choose a verified professional', 'Compare ratings, experience and visit fees for professionals who serve your area.'],
            ['Agree the price, then the work', 'You approve the quote before any work starts, and the job stays on your home record.'],
          ].map(([title, body], index) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-ink-600">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title={`${category.name} near you`}
        subtitle={cities.length > 0 ? 'Cities with verified professionals for this service today.' : undefined}
        muted
      >
        {cities.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={city.local_path ?? `/find-a-technician?category=${category.slug}&city=${city.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-background px-4 text-sm font-medium hover:border-brand-400 hover:text-brand-700"
                >
                  <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {city.name}
                  <span className="text-ink-500">({city.professional_count})</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No professionals for this service yet"
            description="We are onboarding verified professionals for this service. If you offer it, join PakFix."
            action={<ButtonLink href="/become-a-technician">Become a professional</ButtonLink>}
          />
        )}
      </Section>

      {professionals.length > 0 ? (
        <Section
          title="Top-rated professionals"
          action={
            <Link href={`/find-a-technician?category=${category.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              See all &rarr;
            </Link>
          }
        >
          <ProfessionalGrid professionals={professionals} />
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Section title={`${category.name} questions`} muted>
          <div className="max-w-3xl">
            <FaqList faqs={faqs} />
          </div>
        </Section>
      ) : null}

      {related_posts.length > 0 ? (
        <Section title="Guides">
          <PostGrid posts={related_posts} />
        </Section>
      ) : null}

      <Section>
        <Card className="bg-brand-950 text-white">
          <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-xl font-bold">Not sure it is a {category.name.toLowerCase()} problem?</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-brand-100">
                <CircleCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
                Describe it and PakFix points you to the right service.
              </p>
            </div>
            <ButtonLink href="/ai" variant="accent">
              Ask PakFix
            </ButtonLink>
          </CardBody>
        </Card>
      </Section>
    </>
  );
}
