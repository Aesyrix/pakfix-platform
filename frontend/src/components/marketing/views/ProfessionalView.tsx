'use client';

import { BadgeCheck, CalendarDays, Clock, MapPin, MessageSquare, Siren, Sparkles, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Initials, ReviewList, StarRating } from '@/components/marketing/Cards';
import { Breadcrumbs, Section } from '@/components/marketing/PageHeader';
import { PageLoadError, PageSkeleton } from '@/components/marketing/PageStates';
import { usePublicData, useResolvedSlug } from '@/hooks/usePublicData';
import { technicianApi } from '@/lib/api/endpoints';
import type { TechnicianPagePayload } from '@/lib/api/types';

/**
 * A professional's public profile.
 *
 * There is no phone number or email here by design: a customer reaches a
 * professional through PakFix, which is what keeps the job, its price and its
 * history on the record for both sides.
 */
export function ProfessionalView({ slug: builtSlug, initial }: { slug: string | null; initial: TechnicianPagePayload | null }) {
  const slug = useResolvedSlug(builtSlug, 1);
  const query = usePublicData(['professional', slug], () => technicianApi.show(slug as string), initial, Boolean(slug));

  if (!query.data) {
    return query.isError ? (
      <PageLoadError
        error={query.error}
        onRetry={() => query.refetch()}
        notFoundTitle="That professional is not available"
        notFoundDescription="They may no longer be listed on PakFix. Browse verified professionals near you instead."
      />
    ) : (
      <PageSkeleton />
    );
  }

  const { professional, reviews, rating_breakdown } = query.data;
  const totalReviews = rating_breakdown.reduce((sum, row) => sum + row.count, 0);
  const primaryCategory = professional.categories[0];

  return (
    <>
      <header className="border-b border-[var(--border)] bg-gradient-to-b from-brand-wash to-background">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Professionals', href: '/find-a-technician' },
              { name: professional.name },
            ]}
            className="mb-6"
          />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {professional.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={professional.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24" />
            ) : (
              <Initials name={professional.name} className="h-20 w-20 text-2xl sm:h-24 sm:w-24" />
            )}

            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {professional.name}
                {professional.is_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#15803D]">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Verified by PakFix
                  </span>
                ) : null}
              </h1>

              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
                {professional.city ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {professional.city.name}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Wrench className="h-4 w-4" aria-hidden="true" />
                  {professional.years_experience} years experience
                </span>
                {professional.member_since ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    On PakFix since {professional.member_since}
                  </span>
                ) : null}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2">
                  <StarRating value={professional.rating_average} size="md" />
                  <span className="text-lg font-bold">{professional.rating_average.toFixed(1)}</span>
                  <span className="text-sm text-ink-500">({professional.rating_count} reviews)</span>
                </span>
                <span className="text-sm text-ink-500">{professional.completed_jobs_count} jobs completed</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {professional.offers_emergency_service ? (
                  <Badge tone="danger">
                    <Siren className="h-3 w-3" aria-hidden="true" />
                    Takes emergency call-outs
                  </Badge>
                ) : null}
                {professional.visit_fee ? <Badge tone="accent">Visit fee {professional.visit_fee.display}</Badge> : null}
                {professional.hourly_rate ? <Badge tone="neutral">{professional.hourly_rate.display} per hour</Badge> : null}
                {professional.languages.map((language) => (
                  <Badge key={language} tone="neutral">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/*
            Booking arrives in Phase 6. Until then this says so plainly rather
            than offering a button that would not book anything.
          */}
          <Card className="mt-8 border-[#00824A]/30 bg-surface">
            <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Want this professional for a job?</p>
                <p className="mt-1 text-sm text-ink-600">
                  Online booking opens shortly. For now, describe the problem and PakFix support will arrange it with
                  a professional who covers your area.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <ButtonLink href={`/ai?q=${encodeURIComponent(primaryCategory ? `${primaryCategory.name} problem` : '')}`}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Describe my problem
                </ButtonLink>
                <ButtonLink
                  href={`/contact?topic=booking&subject=${encodeURIComponent(`Booking request: ${professional.name}`)}`}
                  variant="secondary"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Request through support
                </ButtonLink>
              </div>
            </CardBody>
          </Card>
        </Container>
      </header>

      <Container className="grid gap-8 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {professional.bio ? (
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-xl font-bold tracking-tight">
                About
              </h2>
              <p className="mt-3 text-pretty leading-relaxed text-ink-700">{professional.bio}</p>
            </section>
          ) : null}

          {professional.categories.length > 0 ? (
            <section aria-labelledby="services-heading" className="mt-10">
              <h2 id="services-heading" className="text-xl font-bold tracking-tight">
                Services offered
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {professional.categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/services/${category.slug}`}
                      className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--border)] bg-surface px-4 text-sm font-medium hover:border-[#00824A] hover:text-[#15803D]"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {professional.portfolio.length > 0 ? (
            <section aria-labelledby="work-heading" className="mt-10">
              <h2 id="work-heading" className="text-xl font-bold tracking-tight">
                Recent work
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {professional.portfolio.map((item, index) => (
                  <li key={`${item.title}-${index}`}>
                    <Card className="h-full overflow-hidden">
                      <div className="grid grid-cols-2">
                        {[item.before_url, item.after_url].map((url, position) =>
                          url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={position}
                              src={url}
                              alt={position === 0 ? 'Before' : 'After'}
                              className="aspect-square w-full object-cover"
                            />
                          ) : null
                        )}
                      </div>
                      <CardBody>
                        <h3 className="font-semibold">{item.title ?? 'Completed job'}</h3>
                        {item.description ? <p className="mt-1 text-sm text-ink-600">{item.description}</p> : null}
                      </CardBody>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="reviews-heading" className="mt-10">
            <h2 id="reviews-heading" className="text-xl font-bold tracking-tight">
              Reviews
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Only customers whose booking was completed on PakFix can leave a review.
            </p>
            <div className="mt-4">
              <ReviewList reviews={reviews} />
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          {totalReviews > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-semibold">Rating breakdown</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {rating_breakdown.map((row) => (
                    <li key={row.stars} className="flex items-center gap-3 text-sm">
                      <span className="w-10 shrink-0 text-ink-600">{row.stars} star</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                        <span
                          className="block h-full rounded-full bg-accent-400"
                          style={{ width: `${Math.round((row.count / totalReviews) * 100)}%` }}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-right text-ink-500">{row.count}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}

          {professional.service_areas.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-semibold">Areas covered</h2>
                <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-600">
                  {professional.service_areas.map((area, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
                      {area.area ? `${area.area}, ${area.city}` : `All of ${area.city}`}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-ink-500">Travels up to {professional.service_radius_km} km.</p>
              </CardBody>
            </Card>
          ) : null}

          {professional.working_days.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4 text-ink-400" aria-hidden="true" />
                  Working days
                </h2>
                <p className="mt-2 text-sm text-ink-600">{professional.working_days.join(', ')}</p>
              </CardBody>
            </Card>
          ) : null}
        </aside>
      </Container>

      <Section muted>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl font-bold tracking-tight">Compare other professionals</h2>
          <ButtonLink
            href={primaryCategory ? `/find-a-technician?category=${primaryCategory.slug}` : '/find-a-technician'}
            variant="secondary"
          >
            See verified professionals near you
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
