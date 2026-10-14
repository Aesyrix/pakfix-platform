import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ContactContent } from './ContactContent';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us | PakFix Support & Customer Care',
  description:
    'Get in touch with PakFix support team. Call +92 300 123 4567 or email support@pakfix.pk for help with bookings, AI diagnosis or technician onboarding.',
  path: '/contact',
});

export default function ContactPage() {
  return <ContactContent />;
}
