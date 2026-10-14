import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { TermsContent } from './TermsContent';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service | PakFix.pk',
  description: 'PakFix terms of service and platform user agreement.',
  path: '/terms-of-service',
});

export default function TermsOfServicePage() {
  return <TermsContent />;
}
