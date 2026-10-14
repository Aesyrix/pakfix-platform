import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { HomeMaintenanceContent } from './HomeMaintenanceContent';

export const metadata: Metadata = pageMetadata({
  title: 'Home Maintenance & Asset Management | PakFix.pk',
  description:
    'Protect your home investment with PakFix preventive maintenance schedules, appliance logs, and automated service reminders across Pakistan.',
  path: '/home-maintenance',
});

export default function HomeMaintenancePage() {
  return <HomeMaintenanceContent />;
}
