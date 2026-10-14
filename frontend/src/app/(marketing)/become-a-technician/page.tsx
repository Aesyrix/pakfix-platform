import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { BecomeTechnicianContent } from './BecomeTechnicianContent';

export const metadata: Metadata = pageMetadata({
  title: 'Become a Technician | Register as a Pro on PakFix.pk',
  description:
    'Join PakFix as a skilled plumber, electrician, AC technician, or appliance specialist. Grow your business, get job requests in your city, and earn more.',
  path: '/become-a-technician',
});

export default function BecomeTechnicianPage() {
  return <BecomeTechnicianContent />;
}
