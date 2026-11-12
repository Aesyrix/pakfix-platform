'use client';

import Link from 'next/link';
import { Banknote, HandCoins, ListChecks, MessageSquareText } from 'lucide-react';
import { useT } from '@/components/i18n/LocaleProvider';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { PageHeader, Section } from '@/components/marketing/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import type { ServiceCategory } from '@/lib/api/types';
import { groupBySection } from '@/lib/catalogue-sections';
import { priceGuide } from '@/lib/price-guide';

/**
 * How prices work on PakFix: offers, not a rate card. The same flow as the
 * app (post a job, optional own price, pros offer, customer chooses, cash).
 * Guide ranges come from the catalogue, so they match the service pages.
 */
export function PricingContent({ categories }: { categories: ServiceCategory[] }) {
  const t = useT();

  const steps = [
    {
      icon: ListChecks,
      title: t('Post your job', 'اپنا کام پوسٹ کریں'),
      body: t(
        'Describe the problem and where you are. If you like, name the price you want to pay.',
        'مسئلہ اور اپنی جگہ بتائیں۔ چاہیں تو وہ قیمت بھی بتائیں جو آپ دینا چاہتے ہیں۔'
      ),
    },
    {
      icon: HandCoins,
      title: t('Pros send offers', 'پروفیشنلز آفرز بھیجتے ہیں'),
      body: t(
        'Verified professionals nearby accept your price or send their own offer.',
        'قریبی تصدیق شدہ پروفیشنلز آپ کی قیمت قبول کرتے ہیں یا اپنی آفر بھیجتے ہیں۔'
      ),
    },
    {
      icon: MessageSquareText,
      title: t('You choose', 'آپ منتخب کرتے ہیں'),
      body: t(
        'Compare offers, ratings and reviews, then pick one. If the job turns out bigger, the pro must send a new price and you approve it first.',
        'آفرز، ریٹنگ اور ریویوز کا موازنہ کریں، پھر ایک منتخب کریں۔ اگر کام بڑا نکلے تو پروفیشنل کو نئی قیمت بھیجنی ہوگی اور پہلے آپ اسے منظور کریں گے۔'
      ),
    },
    {
      icon: Banknote,
      title: t('Pay in cash when done', 'کام مکمل ہونے پر نقد ادائیگی'),
      body: t(
        'You pay the professional in cash after the work is finished. PakFix does not charge customers.',
        'کام مکمل ہونے کے بعد آپ پروفیشنل کو نقد ادائیگی کرتے ہیں۔ پاک فکس کسٹمرز سے کوئی فیس نہیں لیتا۔'
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Pricing', 'قیمتیں') }]}
        title={t('How pricing works', 'قیمتیں کیسے طے ہوتی ہیں')}
        subtitle={t(
          'PakFix does not set prices. Professionals send offers for your job and you choose, or name your own price.',
          'پاک فکس قیمتیں مقرر نہیں کرتا۔ پروفیشنلز آپ کے کام کے لیے آفرز بھیجتے ہیں اور آپ منتخب کرتے ہیں، یا اپنی قیمت بتاتے ہیں۔'
        )}
      />

      <Section title={t('Four steps', 'چار مراحل')}>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-ink-600">{step.body}</p>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {categories.some((c) => c.typical_price) ? (
        <Section
          title={t('What jobs usually cost', 'کام عموماً کتنے کے ہوتے ہیں')}
          subtitle={t(
            'A guide to help you name a fair price. Your job may cost more or less; the offer you accept is the price.',
            'منصفانہ قیمت بتانے میں مدد کے لیے رہنمائی۔ آپ کا کام اس سے کم یا زیادہ کا ہو سکتا ہے؛ جو آفر آپ قبول کریں وہی قیمت ہے۔'
          )}
          muted
        >
          <div className="flex flex-col gap-8">
            {groupBySection(categories.filter((c) => c.typical_price)).map((group) => (
              <div key={group.key}>
                <h3 className="mb-3 font-display text-base font-bold text-ink-900">{t(group.en, group.ur)}</h3>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/services/${c.slug}`}
                        className="flex items-center gap-3 rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2.5 hover:border-brand-300"
                      >
                        <CategoryIcon name={c.icon} className="h-4 w-4 shrink-0 text-brand-600" />
                        <span className="min-w-0 flex-1 text-sm font-medium">{c.name}</span>
                        <span className="shrink-0 text-xs text-ink-500">{priceGuide(t, c.typical_price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
