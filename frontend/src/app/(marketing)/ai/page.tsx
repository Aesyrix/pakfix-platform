import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/marketing/PageStates';
import { AssistantView } from '@/components/marketing/views/AssistantView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Ask PakFix: Check a Home Problem',
  description:
    'Describe what is wrong at home. PakFix checks it for danger first, tells you what to do in an emergency, and points you to the right verified professional.',
  path: '/ai',
});

export default function AssistantPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AssistantView />
    </Suspense>
  );
}
