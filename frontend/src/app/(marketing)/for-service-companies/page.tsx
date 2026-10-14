import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ServiceCompaniesContent } from './ServiceCompaniesContent';

export const metadata: Metadata = pageMetadata({
  title: 'For Service Companies | PakFix.pk Partner Network',
  description:
    'Register your service enterprise or agency on PakFix. Dispatch teams of technicians, manage corporate quotes, and scale your operations.',
  path: '/for-service-companies',
});

export default function ServiceCompaniesPage() {
  return <ServiceCompaniesContent />;
}
