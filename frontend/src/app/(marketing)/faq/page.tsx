import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { FaqContent } from './FaqContent';

export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions (FAQ) | PakFix.pk',
  description:
    'Find answers to common questions about PakFix AI home repair diagnosis, service bookings, technician verification, PKR pricing, and payment options.',
  path: '/faq',
});

export default function FaqPage() {
  return <FaqContent />;
}
