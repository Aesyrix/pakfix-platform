'use client';

import { NotificationsInbox } from '@/components/jobs/NotificationsInbox';
import { Container } from '@/components/ui/Container';
import { useAppText } from '@/lib/i18n/app-text';

/** Everything PakFix has told this person (the same list as the app). */
export default function NotificationsPage() {
  const t = useAppText();
  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <h1 className="mb-5 font-display text-2xl font-bold">{t('notifTitle')}</h1>
      <NotificationsInbox />
    </Container>
  );
}
