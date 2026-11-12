'use client';

import { ArrowRight, CircleCheck, Clock, MapPin, Siren, Sparkles, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { FaqList, PostGrid, ProfessionalGrid } from '@/components/marketing/Cards';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { PageLoadError, PageSkeleton } from '@/components/marketing/PageStates';
import { useFormatDuration, useT } from '@/components/i18n/LocaleProvider';
import { serviceImage } from '@/lib/images';
import { usePublicData, useResolvedSlug } from '@/hooks/usePublicData';
import { catalogueApi } from '@/lib/api/endpoints';
import type { ServicePagePayload } from '@/lib/api/types';

export function ServicePageView({ slug: builtSlug, initial }: { slug: string | null; initial: ServicePagePayload | null }) {
  const t = useT();
  const formatDuration = useFormatDuration();
  const slug = useResolvedSlug(builtSlug, 1);
  const query = usePublicData(['service-page', slug], () => catalogueApi.category(slug as string), initial, Boolean(slug));

  if (!query.data) {
    return query.isError ? (
      <PageLoadError error={query.error} onRetry={() => query.refetch()} notFoundTitle={t('That service is not available', 'وہ خدمت دستیاب نہیں')} />
    ) : (
      <PageSkeleton />
    );
  }

  const { category, parent, trade, common_problems, faqs, cities, professionals, related_posts } = query.data;
  const banner = serviceImage(category.slug);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: t('Home', 'ہوم'), href: '/' },
          { name: t('Services', 'خدمات'), href: '/services' },
          ...(parent ? [{ name: parent.name, href: `/services/${parent.slug}` }] : []),
          { name: category.name },
        ]}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/25">
              <CategoryIcon name={category.icon} className="h-5 w-5" />
            </span>
            {category.is_emergency ? (
              <Badge tone="danger">
                <Siren className="h-3 w-3" aria-hidden="true" />
                {t('Emergency call-outs available', 'ہنگامی کال آؤٹ دستیاب')}
              </Badge>
            ) : null}
            {category.typical_price ? <Badge tone="accent">{t(`Usually ${category.typical_price.display}`, `عموماً ${category.typical_price.display}`)}</Badge> : null}
          </span>
        }
        title={t(`${category.name} services`, `${category.name} خدمات`)}
        subtitle={category.description}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/ai?q=${encodeURIComponent(`${category.name} problem`)}`} size="lg">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t('Describe my problem', 'میرا مسئلہ بیان کریں')}
          </ButtonLink>
          <ButtonLink href={`/find-a-technician?category=${category.slug}`} variant="secondary" size="lg">
            {t(`Find a ${trade?.name ?? 'professional'}`, `${trade?.name ?? 'پروفیشنل'} تلاش کریں`)}
          </ButtonLink>
        </div>
      </PageHeader>

      {banner ? (
        <Container className="pt-12">
          <div className="relative overflow-hidden rounded-3xl shadow-floating ring-1 ring-line/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner} alt="" className="aspect-[21/9] w-full object-cover" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/35 via-transparent to-transparent" />
          </div>
        </Container>
      ) : null}

      {common_problems.length > 0 ? (
        <Section title={t('Common problems we fix', 'عام مسائل جو ہم ٹھیک کرتے ہیں')} subtitle={t('Tap a problem to get a safety check and the right professional.', 'حفاظتی جانچ اور صحیح پروفیشنل کے لیے کسی مسئلے پر ٹیپ کریں۔')}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {common_problems.map((problem) => (
              <li key={problem}>
                <Link
                  href={`/ai?q=${encodeURIComponent(problem)}`}
                  className="card-lift group flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium shadow-xs"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-solid group-hover:text-white group-hover:ring-transparent">
                      <Wrench className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {problem}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-400 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {category.services.length > 0 || category.children.length > 0 ? (
        <Section title={t('Common jobs', 'عام کام')} subtitle={t('PakFix does not set prices. Post your job and verified pros send you offers; you choose one, or name your own price.', 'پاک فکس قیمتیں مقرر نہیں کرتا۔ اپنا کام پوسٹ کریں اور تصدیق شدہ پروفیشنلز آپ کو آفرز بھیجیں گے؛ آپ ایک منتخب کریں، یا اپنی قیمت بتائیں۔')} muted>
          {category.services.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => (
                <li key={service.id}>
                  <div className="card-lift relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card">
                      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-accent-500" />
                      <h3 className="font-display text-lg font-bold text-ink-900">{service.name}</h3>
                      {service.description ? <p className="text-sm text-ink-600">{service.description}</p> : null}
                      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-line pt-4">
                        {service.estimated_minutes ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-600">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />{t(`About ${formatDuration(service.estimated_minutes)}`, `تقریباً ${formatDuration(service.estimated_minutes)}`)}</span>
                        ) : null}
                      </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {category.children.length > 0 ? (
            <div className={category.services.length > 0 ? 'mt-8' : undefined}>
              <h3 className="mb-4 font-display text-base font-bold text-ink-900">{t('Specialist services', 'ماہر خدمات')}</h3>
              <ul className="flex flex-wrap gap-2">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/services/${child.slug}`}
                      className="group inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-line/70 bg-surface px-4 text-sm font-medium text-ink-700 shadow-xs transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-700 hover:shadow-sm"
                    >
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>
      ) : null}

      <Section title={t('How booking works', 'بکنگ کیسے کام کرتی ہے')}>
        <ol className="grid gap-5 md:grid-cols-3">
          {[
            { title: t('Tell us what is wrong', 'بتائیں کیا خراب ہے'), body: t('Describe the problem in your own words. Dangerous problems are flagged straight away.', 'اپنے الفاظ میں مسئلہ بیان کریں۔ خطرناک مسائل فوراً نشان زد ہو جاتے ہیں۔') },
            { title: t('Choose a verified professional', 'تصدیق شدہ پروفیشنل منتخب کریں'), body: t('Compare ratings, experience and visit fees for professionals who serve your area.', 'اپنے علاقے میں خدمات دینے والے پروفیشنلز کی ریٹنگز، تجربہ اور وزٹ فیس کا موازنہ کریں۔') },
            { title: t('Agree the price, then the work', 'قیمت طے کریں، پھر کام'), body: t('You choose an offer before any work starts, and any change in price needs your approval.', 'کام شروع ہونے سے پہلے آپ آفر منتخب کرتے ہیں، اور قیمت میں کسی بھی تبدیلی کے لیے آپ کی منظوری ضروری ہے۔') },
          ].map(({ title, body }, index) => (
            <li key={title} className="card-lift group relative rounded-2xl border border-line bg-surface p-6 shadow-xs">
              <span className="text-gradient-brand block font-display text-5xl font-bold leading-none tracking-[-0.04em] opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
              {index < 2 ? (
                <span aria-hidden="true" className="absolute -right-3.5 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-brand-600 shadow-xs md:flex rtl:-left-3.5 rtl:right-auto rtl:-scale-x-100">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title={t(`${category.name} near you`, `${category.name} آپ کے قریب`)}
        subtitle={cities.length > 0 ? t('Cities with verified professionals for this service today.', 'آج اس خدمت کے لیے تصدیق شدہ پروفیشنلز والے شہر۔') : undefined}
        muted
      >
        {cities.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={city.local_path ?? `/find-a-technician?category=${category.slug}&city=${city.slug}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] border border-line/70 bg-surface ps-3 pe-1.5 text-sm font-semibold text-ink-800 shadow-xs transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-700 hover:shadow-sm"
                >
                  <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {city.name}
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-brand-50 px-2 text-xs font-semibold tabular-nums text-brand-700 ring-1 ring-brand-100">{city.professional_count}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title={t('No professionals for this service yet', 'اس خدمت کے لیے ابھی کوئی پروفیشنل نہیں')}
            description={t('We are onboarding verified professionals for this service. If you offer it, join PakFix.', 'ہم اس خدمت کے لیے تصدیق شدہ پروفیشنلز شامل کر رہے ہیں۔ اگر آپ یہ پیش کرتے ہیں تو پاک فکس جوائن کریں۔')}
            action={<ButtonLink href="/become-a-technician">{t('Become a professional', 'پروفیشنل بنیں')}</ButtonLink>}
          />
        )}
      </Section>

      {professionals.length > 0 ? (
        <Section
          title={t('Verified professionals', 'تصدیق شدہ پروفیشنلز')}
          action={
            <Link href={`/find-a-technician?category=${category.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              {t('See all', 'سب دیکھیں')} &rarr;
            </Link>
          }
        >
          <ProfessionalGrid professionals={professionals} />
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Section title={t(`${category.name} questions`, `${category.name} سوالات`)} muted>
          <div className="max-w-3xl">
            <FaqList faqs={faqs} />
          </div>
        </Section>
      ) : null}

      {related_posts.length > 0 ? (
        <Section title={t('Guides', 'گائیڈز')}>
          <PostGrid posts={related_posts} />
        </Section>
      ) : null}

      <Section>
        <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-premium-dark text-white shadow-floating">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark" />
          <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 h-72 w-96 rounded-full bg-brand-500/30 blur-[100px]" />
          <div className="flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.015em] sm:text-3xl">{t(`Not sure it is a ${category.name.toLowerCase()} problem?`, `یقین نہیں کہ یہ ${category.name} کا مسئلہ ہے؟`)}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-300">
                <CircleCheck className="h-4 w-4 text-brand-on-dark" aria-hidden="true" />
                {t('Describe it and PakFix points you to the right service.', 'اسے بیان کریں اور پاک فکس آپ کو صحیح سروس کی طرف رہنمائی کرے گا۔')}
              </p>
            </div>
            <ButtonLink href="/ai" size="lg" className="shrink-0 rounded-full shadow-lg shadow-brand-500/30">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t('Ask PakFix', 'پاک فکس سے پوچھیں')}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
