import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = pageMetadata({
  title: 'About PakFix.pk | Pakistan’s Smart Home Repair Platform',
  description:
    'Discover PakFix mission: transforming home maintenance across Pakistan using artificial intelligence, verified local technicians, and fair pricing.',
  path: '/about',
});

export default function AboutPage() {
  return <AboutContent />;
}
