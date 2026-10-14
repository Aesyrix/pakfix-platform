import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { SafetyContent } from './SafetyContent';

export const metadata: Metadata = pageMetadata({
  title: 'Safety Rules & Pro Verification | PakFix.pk',
  description:
    'PakFix safety standards, CNIC technician background verification, and AI hazard detection for home repairs in Pakistan.',
  path: '/safety',
});

export default function SafetyPage() {
  return <SafetyContent />;
}
