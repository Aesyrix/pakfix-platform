'use client';

import { ArrowRight, CircleCheck, MapPin, Siren, Sparkles, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
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
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-brand-600 text-white">
              <CategoryIcon name={category.icon} className="h-5 w-5" />
            </span>
            {category.is_emergency ? (
              <Badge tone="danger">
                <Siren className="h-3 w-3" aria-hidden="true" />
                {t('Emergency call-outs available', 'ہنگامی کال آؤٹ دستیاب')}
              </Badge>
            ) : null}
            {category.typical_price ? <Badge tone="accent">{t(`Typically ${category.typical_price.display}`, `عموماً ${category.typical_price.display}`)}</Badge> : null}
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
        <Container className="pt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner}
            alt=""
            className="aspect-[21/9] w-full rounded-[var(--radius-card)] object-cover"
          />
        </Container>
      ) : null}

      {common_problems.length > 0 ? (
        <Section title={t('Common problems we fix', 'عام مسائل جو ہم ٹھیک کرتے ہیں')} subtitle={t('Tap a problem to get a safety check and the right professional.', 'حفاظتی جانچ اور صحیح پروفیشنل کے لیے کسی مسئلے پر ٹیپ کریں۔')}>
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
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-400 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {category.services.length > 0 || category.children.length > 0 ? (
        <Section title={t('Services and prices', 'خدمات اور قیمتیں')} subtitle={t('Fixed prices are what you pay for that job. Everything else is quoted after inspection, before work starts.', 'مقررہ قیمت وہ ہے جو آپ اس کام کے لیے ادا کرتے ہیں۔ باقی سب معائنے کے بعد، کام شروع ہونے سے پہلے کوٹ کیا جاتا ہے۔')} muted>
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
                          <span className="text-xs text-ink-500">{t(`About ${formatDuration(service.estimated_minutes)}`, `تقریباً ${formatDuration(service.estimated_minutes)}`)}</span>
                        ) : null}
                      </div>
                      {service.pricing_model === 'visit_fee' ? (
                        <p className="text-xs text-ink-500">{t('Inspection visit; repair quoted on site.', 'معائنہ وزٹ؛ مرمت موقع پر کوٹ کی جائے گی۔')}</p>
                      ) : null}
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          ) : null}

          {category.children.length > 0 ? (
            <div className={category.services.length > 0 ? 'mt-8' : undefined}>
              <h3 className="mb-3 text-base font-semibold">{t('Specialist services', 'ماہر خدمات')}</h3>
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

      <Section title={t('How booking works', 'بکنگ کیسے کام کرتی ہے')}>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            { title: t('Tell us what is wrong', 'بتائیں کیا خراب ہے'), body: t('Describe the problem or send a photo. Dangerous problems are flagged straight away.', 'مسئلہ بیان کریں یا تصویر بھیجیں۔ خطرناک مسائل فوراً نشان زد کیے جاتے ہیں۔') },
            { title: t('Choose a verified professional', 'تصدیق شدہ پروفیشنل منتخب کریں'), body: t('Compare ratings, experience and visit fees for professionals who serve your area.', 'اپنے علاقے میں خدمات دینے والے پروفیشنلز کی ریٹنگز، تجربہ اور وزٹ فیس کا موازنہ کریں۔') },
            { title: t('Agree the price, then the work', 'قیمت طے کریں، پھر کام'), body: t('You approve the quote before any work starts, and the job stays on your home record.', 'کام شروع ہونے سے پہلے آپ کوٹ منظور کرتے ہیں، اور کام آپ کے ہوم ریکارڈ میں محفوظ رہتا ہے۔') },
          ].map(({ title, body }, index) => (
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
            title={t('No professionals for this service yet', 'اس خدمت کے لیے ابھی کوئی پروفیشنل نہیں')}
            description={t('We are onboarding verified professionals for this service. If you offer it, join PakFix.', 'ہم اس خدمت کے لیے تصدیق شدہ پروفیشنلز شامل کر رہے ہیں۔ اگر آپ یہ پیش کرتے ہیں تو پاک فکس جوائن کریں۔')}
            action={<ButtonLink href="/become-a-technician">{t('Become a professional', 'پروفیشنل بنیں')}</ButtonLink>}
          />
        )}
      </Section>

      {professionals.length > 0 ? (
        <Section
          title={t('Top-rated professionals', 'اعلیٰ درجہ بند پروفیشنلز')}
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
        <Card className="bg-brand-950 text-white">
          <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-xl font-bold">{t(`Not sure it is a ${category.name.toLowerCase()} problem?`, `یقین نہیں کہ یہ ${category.name} کا مسئلہ ہے؟`)}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-brand-100">
                <CircleCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
                {t('Describe it and PakFix points you to the right service.', 'اسے بیان کریں اور پاک فکس آپ کو صحیح سروس کی طرف رہنمائی کرے گا۔')}
              </p>
            </div>
            <ButtonLink href="/ai" variant="accent">
              {t('Ask PakFix', 'پاک فکس سے پوچھیں')}
            </ButtonLink>
          </CardBody>
        </Card>
      </Section>
    </>
  );
}
