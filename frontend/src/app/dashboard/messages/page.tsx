'use client';

import { ConversationList } from '@/components/jobs/Chat';
import { Container } from '@/components/ui/Container';
import { useAppText } from '@/lib/i18n/app-text';

/** Chats with the other person on each job (the app's Messages). */
export default function MessagesPage() {
  const t = useAppText();
  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <h1 className="mb-5 font-display text-2xl font-bold">{t('navMessages')}</h1>
      <ConversationList area="dashboard" />
    </Container>
  );
}
