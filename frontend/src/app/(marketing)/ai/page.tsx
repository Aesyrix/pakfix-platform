import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AssistantView, AssistantViewFromUrl } from '@/components/marketing/views/AssistantView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Ask PakFix: Check Any Problem',
  description:
    'Describe what is wrong. PakFix checks it for danger first, tells you what to do in an emergency, and points you to the right verified professional.',
  path: '/ai',
});

export default function AssistantPage() {
  // The built page is the empty assistant, so it shows at once; the browser
  // then fills in a question passed in the URL (?q=).
  return (
    <Suspense fallback={<AssistantView />}>
      <AssistantViewFromUrl />
    </Suspense>
  );
}
