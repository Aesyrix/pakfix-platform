import type { Metadata } from 'next';
import { contentApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { pageMetadata } from '@/lib/seo';
import { RefundContent } from './RefundContent';

/**
 * Served from the CMS, so support and legal can change the wording from the
 * admin dashboard without a deploy.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await safeFetch(() => contentApi.page('refund-policy'), null, 'refund policy');

  return pageMetadata({
    title: page?.seo.title ?? 'Refund Policy',
    description: page?.seo.description ?? 'How PakFix handles refunds, cancellations and disputed jobs.',
    path: '/refund-policy',
  });
}

export default async function RefundPolicyPage() {
  const page = await safeFetch(() => contentApi.page('refund-policy'), null, 'refund policy');

  return (
    <RefundContent title={page?.title} updatedAt={page?.updated_at} bodyHtml={page?.body_html} />
  );
}
