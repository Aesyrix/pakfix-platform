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
import { useFormatDate, useT } from '@/components/i18n/LocaleProvider';
import { professionalImage } from '@/lib/images';
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
  const t = useT();
  const formatDate = useFormatDate();
  const slug = useResolvedSlug(builtSlug, 1);
  const query = usePublicData(['professional', slug], () => technicianApi.show(slug as string), initial, Boolean(slug));

  if (!query.data) {
    return query.isError ? (
      <PageLoadError
        error={query.error}
        onRetry={() => query.refetch()}
        notFoundTitle={t('That professional is not available', 'وہ پروفیشنل دستیاب نہیں')}
        notFoundDescription={t('They may no longer be listed on PakFix. Browse verified professionals near you instead.', 'وہ اب پاک فکس پر درج نہیں ہو سکتے۔ اس کے بجائے اپنے قریب تصدیق شدہ پروفیشنلز دیکھیں۔')}
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
              { name: t('Home', 'ہوم'), href: '/' },
              { name: t('Professionals', 'پروفیشنلز'), href: '/find-a-technician' },
              { name: professional.name },
            ]}
            className="mb-6"
          />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {professional.avatar_url ?? professionalImage(professional.slug) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(professional.avatar_url ?? professionalImage(professional.slug)) as string}
                alt=""
                className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
              />
            ) : (
              <Initials name={professional.name} className="h-20 w-20 text-2xl sm:h-24 sm:w-24" />
            )}

            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {professional.name}
                {professional.is_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#15803D]">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('Verified by PakFix', 'پاک فکس سے تصدیق شدہ')}
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
                  {t(`${professional.years_experience} ${professional.years_experience === 1 ? 'year' : 'years'} experience`, `${professional.years_experience} سال تجربہ`)}
                </span>
                {professional.member_since ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {t(`On PakFix since ${formatDate(`15 ${professional.member_since}`, { month: 'long', year: 'numeric' })}`, `${formatDate(`15 ${professional.member_since}`, { month: 'long', year: 'numeric' })} سے پاک فکس پر`)}
                  </span>
                ) : null}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2">
                  <StarRating value={professional.rating_average} size="md" />
                  <span className="text-lg font-bold">{professional.rating_average.toFixed(1)}</span>
                  <span className="text-sm text-ink-500">{t(`(${professional.rating_count} ${professional.rating_count === 1 ? 'review' : 'reviews'})`, `(${professional.rating_count} ${professional.rating_count === 1 ? 'ریویو' : 'ریویوز'})`)}</span>
                </span>
                <span className="text-sm text-ink-500">{t(`${professional.completed_jobs_count} ${professional.completed_jobs_count === 1 ? 'job' : 'jobs'} completed`, `${professional.completed_jobs_count} مکمل کام`)}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {professional.offers_emergency_service ? (
                  <Badge tone="danger">
                    <Siren className="h-3 w-3" aria-hidden="true" />
                    {t('Takes emergency call-outs', 'ہنگامی کال آؤٹ لیتے ہیں')}
                  </Badge>
                ) : null}
                {professional.visit_fee ? <Badge tone="accent">{t(`Visit fee ${professional.visit_fee.display}`, `وزٹ فیس ${professional.visit_fee.display}`)}</Badge> : null}
                {professional.hourly_rate ? <Badge tone="neutral">{t(`${professional.hourly_rate.display} per hour`, `${professional.hourly_rate.display} فی گھنٹہ`)}</Badge> : null}
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
                <p className="font-semibold">{t('Want this professional for a job?', 'اس پروفیشنل کو کسی کام کے لیے چاہتے ہیں؟')}</p>
                <p className="mt-1 text-sm text-ink-600">
                  {t('Online booking opens shortly. For now, describe the problem and PakFix support will arrange it with a professional who covers your area.', 'آن لائن بکنگ جلد شروع ہوگی۔ اس دوران مسئلہ بیان کریں اور پاک فکس سپورٹ آپ کے علاقے میں آنے والے پروفیشنل سے انتظام کرے گی۔')}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <ButtonLink href={`/ai?q=${encodeURIComponent(primaryCategory ? `${primaryCategory.name} problem` : '')}`}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t('Describe my problem', 'میرا مسئلہ بیان کریں')}
                </ButtonLink>
                <ButtonLink
                  href={`/contact?topic=booking&subject=${encodeURIComponent(`Booking request: ${professional.name}`)}`}
                  variant="secondary"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  {t('Request through support', 'سپورٹ کے ذریعے درخواست کریں')}
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
                {t('About', 'تعارف')}
              </h2>
              <p className="mt-3 text-pretty leading-relaxed text-ink-700">{professional.bio}</p>
            </section>
          ) : null}

          {professional.categories.length > 0 ? (
            <section aria-labelledby="services-heading" className="mt-10">
              <h2 id="services-heading" className="text-xl font-bold tracking-tight">
                {t('Services offered', 'پیش کردہ خدمات')}
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
                {t('Recent work', 'حالیہ کام')}
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
                              alt={position === 0 ? t('Before', 'پہلے') : t('After', 'بعد')}
                              className="aspect-square w-full object-cover"
                            />
                          ) : null
                        )}
                      </div>
                      <CardBody>
                        <h3 className="font-semibold">{item.title ?? t('Completed job', 'مکمل کام')}</h3>
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
              {t('Reviews', 'ریویوز')}
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {t('Only customers whose booking was completed on PakFix can leave a review.', 'صرف وہ گاہک جن کی بکنگ پاک فکس پر مکمل ہوئی ہو، ریویو چھوڑ سکتے ہیں۔')}
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
                <h2 className="font-semibold">{t('Rating breakdown', 'ریٹنگ کی تفصیل')}</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {rating_breakdown.map((row) => (
                    <li key={row.stars} className="flex items-center gap-3 text-sm">
                      <span className="w-10 shrink-0 text-ink-600">{t(`${row.stars} ${row.stars === 1 ? 'star' : 'stars'}`, `${row.stars} ${row.stars === 1 ? 'ستارہ' : 'ستارے'}`)}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                        <span
                          className="block h-full rounded-full bg-accent-400"
                          style={{ width: `${Math.round((row.count / totalReviews) * 100)}%` }}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-end text-ink-500">{row.count}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}

          {professional.service_areas.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-semibold">{t('Areas covered', 'شامل علاقے')}</h2>
                <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-600">
                  {professional.service_areas.map((area, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
                      {area.area ? `${area.area}, ${area.city}` : t(`All of ${area.city}`, `${area.city} کا پورا`)}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-ink-500">{t(`Travels up to ${professional.service_radius_km} km.`, `زیادہ سے زیادہ ${professional.service_radius_km} کلومیٹر تک سفر۔`)}</p>
              </CardBody>
            </Card>
          ) : null}

          {professional.working_days.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4 text-ink-400" aria-hidden="true" />
                  {t('Working days', 'کام کے دن')}
                </h2>
                <p className="mt-2 text-sm text-ink-600">{professional.working_days.join(', ')}</p>
              </CardBody>
            </Card>
          ) : null}
        </aside>
      </Container>

      <Section muted>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl font-bold tracking-tight">{t('Compare other professionals', 'دیگر پروفیشنلز کا موازنہ کریں')}</h2>
          <ButtonLink
            href={primaryCategory ? `/find-a-technician?category=${primaryCategory.slug}` : '/find-a-technician'}
            variant="secondary"
          >
            {t('See verified professionals near you', 'اپنے قریب تصدیق شدہ پروفیشنلز دیکھیں')}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
