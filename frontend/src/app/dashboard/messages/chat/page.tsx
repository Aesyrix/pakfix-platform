'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ChatThread } from '@/components/jobs/Chat';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAppText } from '@/lib/i18n/app-text';

/** One job's chat. */
export default function ChatPage() {
  return (
    <Suspense fallback={<Container className="py-6"><SkeletonCard /></Container>}>
      <Chat />
    </Suspense>
  );
}

function Chat() {
  const t = useAppText();
  const id = useSearchParams().get('id') ?? '';
  return (
    <Container className="max-w-3xl py-4 sm:py-6">
      <Link href="/dashboard/messages" className="mb-3 inline-block text-sm font-medium text-brand-700 hover:underline">
        {t('actionBack')}
      </Link>
      {id ? <ChatThread key={id} bookingId={id} area="dashboard" /> : <ErrorState description={t('errorTitle')} />}
    </Container>
  );
}
