import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { DeleteAccountContent } from './DeleteAccountContent';

export const metadata: Metadata = pageMetadata({
  title: 'Delete your PakFix account | PakFix.pk',
  description:
    'How to delete your PakFix account and personal data, from the app or this page, and what PakFix keeps afterwards.',
  path: '/delete-account',
});

export default function DeleteAccountPage() {
  return <DeleteAccountContent />;
}
