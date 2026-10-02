import type { Metadata } from 'next';
import { FaqAccordionSection } from '@/components/marketing/homepage/FaqAccordionSection';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions (FAQ) | PakFix.pk',
  description:
    'Find answers to common questions about PakFix AI home repair diagnosis, service bookings, technician verification, PKR pricing, and payment options.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'FAQ' }]}
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about using PakFix AI, booking local technicians, and transparent pricing."
      />
      <FaqAccordionSection />
    </>
  );
}
