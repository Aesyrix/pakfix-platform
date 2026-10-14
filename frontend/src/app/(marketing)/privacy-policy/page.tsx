import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PrivacyContent } from './PrivacyContent';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy | PakFix.pk',
  description: 'PakFix privacy policy and data protection guidelines.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
