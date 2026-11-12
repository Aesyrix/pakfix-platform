import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { RefundContent } from './RefundContent';

/**
 * Text from the "PakFix Legal Pages" draft (13 November 2026), kept in code
 * like the other legal pages so all of them change together after legal
 * review. It no longer reads the CMS "refund-policy" page.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Cancellation and Refund Policy',
  description: 'How cancellations, price changes, disputes and refunds work on PakFix, where jobs are paid in cash to the professional.',
  path: '/refund-policy',
});

export default function RefundPolicyPage() {
  return <RefundContent />;
}
