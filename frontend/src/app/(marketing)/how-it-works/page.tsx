import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { HowItWorksContent } from './HowItWorksContent';

export const metadata: Metadata = pageMetadata({
  title: 'How PakFix Works | Smart Home Repair & Maintenance',
  description:
    'Learn how PakFix connects you with verified repair professionals in 4 easy steps: AI diagnosis, quote comparison, technician dispatch, and secure tracking.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
