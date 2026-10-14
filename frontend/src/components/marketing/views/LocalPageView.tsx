'use client';

import { ArrowRight, MapPin, ShieldCheck, Sparkles, Star, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { FaqList, LinkPills, PostGrid, ProfessionalGrid, ReviewList } from '@/components/marketing/Cards';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { PageLoadError, PageSkeleton } from '@/components/marketing/PageStates';
import { useT } from '@/components/i18n/LocaleProvider';
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
  const t = useT();
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
        notFoundTitle={t('We do not cover that service there yet', 'ہم وہاں ابھی وہ خدمت فراہم نہیں کرتے')}
        notFoundDescription={t('PakFix only lists a service in a city once verified professionals actually cover it.', 'پاک فکس کسی شہر میں خدمت صرف اس وقت درج کرتا ہے جب تصدیق شدہ پروفیشنلز واقعی وہاں دستیاب ہوں۔')}
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
          { name: t('Home', 'ہوم'), href: '/' },
          { name: data.city.name, href: `/${data.city.slug}` },
          { name: tradeName },
        ]}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone="verified">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t(`${data.professional_count} verified ${data.professional_count === 1 ? 'professional' : 'professionals'}`, `${data.professional_count} تصدیق شدہ ${data.professional_count === 1 ? 'پروفیشنل' : 'پروفیشنلز'}`)}
            </Badge>
            {data.average_rating > 0 ? (
              <Badge tone="accent">
                <Star className="h-3 w-3" aria-hidden="true" />
                {t(`${data.average_rating.toFixed(1)} average rating`, `${data.average_rating.toFixed(1)} اوسط ریٹنگ`)}
              </Badge>
            ) : null}
            {data.category.typical_price ? <Badge tone="neutral">{t(`Typically ${data.category.typical_price.display}`, `عموماً ${data.category.typical_price.display}`)}</Badge> : null}
          </span>
        }
        title={t(`${tradeName} in ${data.city.name}`, `${data.city.name} میں ${tradeName}`)}
        subtitle={t(
          `Book an identity-checked ${tradeName.toLowerCase()} covering ${data.city.name}. You see the price before any work starts, and every job stays on your home's record.`,
          `${data.city.name} میں شناخت جانچے گئے ${tradeName} بک کریں۔ کام شروع ہونے سے پہلے آپ قیمت دیکھتے ہیں، اور ہر کام آپ کے ہوم ریکارڈ میں محفوظ رہتا ہے۔`
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/ai?q=${encodeURIComponent(`${data.category.name} problem in ${data.city.name}`)}`} size="lg">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t('Describe my problem', 'میرا مسئلہ بیان کریں')}
          </ButtonLink>
          <ButtonLink
            href={`/find-a-technician?category=${data.category.slug}&city=${data.city.slug}`}
            variant="secondary"
            size="lg"
          >
            {t(`Compare ${data.professional_count} ${data.professional_count === 1 ? 'professional' : 'professionals'}`, `${data.professional_count} ${data.professional_count === 1 ? 'پروفیشنل کا' : 'پروفیشنلز کا'} موازنہ کریں`)}
          </ButtonLink>
        </div>
      </PageHeader>

      {data.common_problems.length > 0 ? (
        <Section title={t(`What a ${tradeName.toLowerCase()} in ${data.city.name} is called out for`, `${data.city.name} میں ${tradeName} کو کن کاموں کے لیے بلایا جاتا ہے`)}>
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
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-400 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title={t(`${tradeName}s available in ${data.city.name}`, `${data.city.name} میں دستیاب ${tradeName}`)} muted>
        <ProfessionalGrid professionals={data.professionals} />
      </Section>

      {data.category.services.length > 0 ? (
        <Section title={t('Typical jobs and prices', 'عام کام اور قیمتیں')}>
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
            {t(`Prices are typical for ${data.city.name}. Your professional confirms the price before starting.`, `${data.city.name} کے لیے قیمتیں عام ہیں۔ آپ کا پروفیشنل شروع کرنے سے پہلے قیمت کی تصدیق کرتا ہے۔`)}
          </p>
        </Section>
      ) : null}

      {data.reviews.length > 0 ? (
        <Section title={t(`What ${data.city.name} customers said`, `${data.city.name} کے گاہکوں نے کیا کہا`)} muted>
          <ReviewList reviews={data.reviews} />
        </Section>
      ) : null}

      {data.areas.length > 0 ? (
        <Section title={t(`Areas covered in ${data.city.name}`, `${data.city.name} میں شامل علاقے`)}>
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
        <Section title={t(`${tradeName} questions`, `${tradeName} سوالات`)} muted>
          <div className="max-w-3xl">
            <FaqList faqs={data.faqs} />
          </div>
        </Section>
      ) : null}

      {data.related_posts.length > 0 ? (
        <Section title={t('Guides', 'گائیڈز')}>
          <PostGrid posts={data.related_posts} />
        </Section>
      ) : null}

      {data.same_trade_other_cities.length > 0 || data.other_trades_in_city.length > 0 ? (
        <Section muted>
          <div className="grid gap-8 md:grid-cols-2">
            {data.same_trade_other_cities.length > 0 ? (
              <div>
                <h2 className="mb-3 text-lg font-semibold">{t(`${tradeName} in other cities`, `دیگر شہروں میں ${tradeName}`)}</h2>
                <LinkPills links={data.same_trade_other_cities} label={t(`${tradeName} in other cities`, `دیگر شہروں میں ${tradeName}`)} />
              </div>
            ) : null}
            {data.other_trades_in_city.length > 0 ? (
              <div>
                <h2 className="mb-3 text-lg font-semibold">{t(`Other services in ${data.city.name}`, `${data.city.name} میں دیگر خدمات`)}</h2>
                <LinkPills links={data.other_trades_in_city} label={t(`Other services in ${data.city.name}`, `${data.city.name} میں دیگر خدمات`)} />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}
    </>
  );
}
