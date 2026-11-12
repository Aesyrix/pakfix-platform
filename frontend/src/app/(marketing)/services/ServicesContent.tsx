'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { SiteSearchBox } from '@/components/marketing/SiteSearchBox';
import { useT } from '@/components/i18n/LocaleProvider';
import type { ServiceCategory } from '@/lib/api/types';
import { groupBySection } from '@/lib/catalogue-sections';
import { priceGuide } from '@/lib/price-guide';

export function ServicesContent({ categories }: { categories: ServiceCategory[] }) {
  const t = useT();
  const emergency = categories.filter((category) => category.is_emergency);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Services', 'خدمات') }]}
        title={t('Every service, one place', 'ہر خدمت، ایک جگہ')}
        subtitle={t('Post your job and verified pros send you offers. You choose the one you like, or name your own price. Ranges shown are only a guide.', 'اپنا کام پوسٹ کریں اور تصدیق شدہ پروفیشنلز آپ کو آفرز بھیجیں گے۔ جو پسند ہو وہ منتخب کریں، یا اپنی قیمت بتائیں۔ دکھائی گئی حدیں صرف رہنمائی کے لیے ہیں۔')}
      >
        <SiteSearchBox placeholder={t('Search for a service, e.g. geyser, termites, CCTV', 'خدمت تلاش کریں، مثلاً گیزر، دیمک، سی سی ٹی وی')} />
      </PageHeader>

      {emergency.length > 0 ? (
        <Section title={t('Emergency services', 'ہنگامی خدمات')} subtitle={t('For problems that cannot wait. PakFix raises these as high priority; it does not promise a fixed arrival time.', 'ان مسائل کے لیے جو انتظار نہیں کر سکتے۔ پاک فکس انہیں اعلیٰ ترجیح دیتا ہے؛ یہ آمد کا مقررہ وقت وعدہ نہیں کرتا۔')}>
          <ul className="flex flex-wrap gap-2">
            {emergency.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/services/${category.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-danger-500/40 bg-danger-500/10 px-4 text-sm font-semibold text-danger-600 hover:bg-danger-500/15"
                >
                  <CategoryIcon name={category.icon} className="h-4 w-4" />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {categories.length === 0 ? (
        <Section title={t('All services', 'تمام خدمات')} muted>
          <EmptyState title={t('Services are being updated', 'خدمات اپ ڈیٹ کی جا رہی ہیں')} description={t('The service list could not be loaded. Please try again shortly.', 'خدمات کی فہرست لوڈ نہیں ہو سکی۔ براہِ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔')} />
        </Section>
      ) : (
        // Home, Car & Bike, Electronics: the same groups as the app.
        groupBySection(categories).map((group, index) => (
          <Section key={group.key} title={t(group.en, group.ur)} subtitle={t(group.blurbEn, group.blurbUr)} muted={index % 2 === 0}>
            <CategoryCards categories={group.categories} />
          </Section>
        ))
      )}
    </>
  );
}

function CategoryCards({ categories }: { categories: ServiceCategory[] }) {
  const t = useT();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <li key={category.id}>
          <Card interactive className="relative h-full">
            <CardBody className="flex h-full flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                  <CategoryIcon name={category.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    <Link href={`/services/${category.slug}`} className="after:absolute after:inset-0 hover:text-brand-700">
                      {category.name}
                    </Link>
                  </h3>
                  {category.typical_price ? <p className="text-sm text-ink-500">{priceGuide(t, category.typical_price)}</p> : null}
                </div>
              </div>
              {category.description ? <p className="flex-1 text-sm text-ink-600">{category.description}</p> : null}
              {category.children.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {category.children.slice(0, 4).map((child) => (
                    <Badge key={child.id} tone="neutral">
                      {child.name}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardBody>
          </Card>
        </li>
      ))}
    </ul>
  );
}
