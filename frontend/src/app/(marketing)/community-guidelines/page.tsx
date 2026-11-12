import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { CommunityContent } from './CommunityContent';

export const metadata: Metadata = pageMetadata({
  title: 'Community Guidelines',
  description: 'The rules for everyone on PakFix: respect, honesty, keeping jobs on PakFix, safety, reviews, and reporting and blocking.',
  path: '/community-guidelines',
});

export default function CommunityGuidelinesPage() {
  return <CommunityContent />;
}
