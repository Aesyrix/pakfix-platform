'use client';

import { SettingsPanel } from '@/components/account/SettingsPanel';
import { Container } from '@/components/ui/Container';
import { useAppText } from '@/lib/i18n/app-text';

/** Language, appearance, blocked people, legal pages and account deletion (the app's Account screen). */
export default function SettingsPage() {
  const t = useAppText();
  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <h1 className="mb-5 font-display text-2xl font-bold">{t('accountTitle')}</h1>
      <SettingsPanel />
    </Container>
  );
}
