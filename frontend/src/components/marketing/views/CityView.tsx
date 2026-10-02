'use client';

import { MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { FaqList, PostGrid, ProfessionalGrid } from '@/components/marketing/Cards';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { PageLoadError, PageSkeleton } from '@/components/marketing/PageStates';
import { usePublicData, useResolvedSlug } from '@/hooks/usePublicData';
import { localApi } from '@/lib/api/endpoints';
import type { CityPagePayload } from '@/lib/api/types';

/** A city landing page, e.g. /lahore. */
export function CityView({ slug: builtSlug, initial }: { slug: string | null; initial: CityPagePayload | null }) {
  const slug = useResolvedSlug(builtSlug, 0);
  const query = usePublicData(['city-page', slug], () => localApi.city(slug as string), initial, Boolean(slug));

  if (!query.data) {
    return query.isError ? (
      <PageLoadError
        error={query.error}
        onRetry={() => query.refetch()}
        notFoundTitle="PakFix is not live in that city yet"
        notFoundDescription="We are expanding city by city. See where PakFix works today."
      />
    ) : (
      <PageSkeleton />
    );
  }

  const { city, professional_count, categories, areas, professionals, guides, faqs } = query.data;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: city.name }]}
        eyebrow={
          <Badge tone="brand">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {city.province ? `${city.name}, ${city.province}` : city.name}
          </Badge>
        }
        title={`Home repair and maintenance in ${city.name}`}
        subtitle={
          professional_count > 0
            ? `${professional_count} verified ${professional_count === 1 ? 'professional' : 'professionals'} covering ${city.name}, across ${categories.length} ${categories.length === 1 ? 'service' : 'services'}.`
            : `PakFix is live in ${city.name}. Describe your problem and we will match you with a professional.`
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/ai" size="lg">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Describe my problem
          </ButtonLink>
          <ButtonLink href={`/find-a-technician?city=${city.slug}`} variant="secondary" size="lg">
            Browse {city.name} professionals
          </ButtonLink>
        </div>
      </PageHeader>

      {categories.length > 0 ? (
        <Section title={`Services available in ${city.name}`} subtitle="Only services with verified professionals covering this city are listed.">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Card interactive className="relative h-full">
                  <CardBody className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-[#15803D]">
                      <CategoryIcon name={category.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <Link
                        href={category.local_path ?? `/find-a-technician?category=${category.slug}&city=${city.slug}`}
                        className="font-semibold after:absolute after:inset-0 hover:text-[#15803D]"
                      >
                        {category.name}
                      </Link>
                      <span className="block text-sm text-ink-500">
                        {category.professional_count} {category.professional_count === 1 ? 'professional' : 'professionals'}
                      </span>
                    </span>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {professionals.length > 0 ? (
        <Section
          title={`Top-rated in ${city.name}`}
          muted
          action={
            <Link href={`/find-a-technician?city=${city.slug}`} className="text-sm font-semibold text-[#16A34A] hover:text-[#15803D]">
              See all &rarr;
            </Link>
          }
        >
          <ProfessionalGrid professionals={professionals} />
        </Section>
      ) : null}

      {areas.length > 0 ? (
        <Section title={`Areas we cover in ${city.name}`}>
          <ul className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <li
                key={area.id}
                className="inline-flex min-h-10 items-center rounded-[var(--radius-pill)] border border-[var(--border)] bg-surface px-3.5 text-sm text-ink-600"
              >
                {area.name}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-500">
            Not listed? Professionals often travel further; enter your address when you book and we will tell you.
          </p>
        </Section>
      ) : null}

      {guides.length > 0 ? (
        <Section title="Home guides" muted>
          <PostGrid posts={guides} />
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Section title={`Questions about PakFix in ${city.name}`}>
          <div className="max-w-3xl">
            <FaqList faqs={faqs} />
          </div>
        </Section>
      ) : null}
    </>
  );
}
