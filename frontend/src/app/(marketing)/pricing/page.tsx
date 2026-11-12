import type { Metadata } from 'next';
import { catalogueApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { pageMetadata } from '@/lib/seo';
import { PricingContent } from './PricingContent';

export const metadata: Metadata = pageMetadata({
  title: 'How Pricing Works',
  description:
    'PakFix does not set prices. Post your job, verified professionals send offers, and you choose or name your own price. Pay the professional in cash when the work is done.',
  path: '/pricing',
});

export default async function PricingPage() {
  const categories = await safeFetch(() => catalogueApi.categories(), [], 'service tree');

  return <PricingContent categories={categories} />;
}
