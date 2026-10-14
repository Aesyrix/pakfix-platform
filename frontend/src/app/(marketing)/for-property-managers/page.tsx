import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PropertyManagersContent } from './PropertyManagersContent';

export const metadata: Metadata = pageMetadata({
  title: 'For Property Managers & Landlords | PakFix.pk',
  description:
    'Manage repairs across multiple rental properties, tenant requests, and maintenance records with PakFix.',
  path: '/for-property-managers',
});

export default function PropertyManagersPage() {
  return <PropertyManagersContent />;
}
