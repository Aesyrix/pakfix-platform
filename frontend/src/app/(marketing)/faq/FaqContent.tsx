'use client';

import { FaqAccordionSection } from '@/components/marketing/homepage/FaqAccordionSection';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function FaqContent() {
  const t = useT();
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('FAQ', 'سوالات') }]}
        title={t('Frequently Asked Questions', 'اکثر پوچھے جانے والے سوالات')}
        subtitle={t('Everything you need to know about using PakFix AI, booking local technicians, and transparent pricing.', 'پاک فکس اے آئی استعمال کرنے، مقامی ٹیکنیشن بک کرنے اور شفاف قیمتوں کے بارے میں ہر وہ چیز جو آپ جاننا چاہتے ہیں۔')}
      />
      <FaqAccordionSection />
    </>
  );
}
