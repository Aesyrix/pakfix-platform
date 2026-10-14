import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PricingContent } from './PricingContent';

export const metadata: Metadata = pageMetadata({
  title: 'Service Pricing & PKR Estimates | PakFix.pk',
  description:
    'Transparent pricing guidelines for plumbing, electrical, AC repair and appliance maintenance across Pakistan. No hidden fees.',
  path: '/pricing',
});

export default function PricingPage() {
  return <PricingContent />;
}
