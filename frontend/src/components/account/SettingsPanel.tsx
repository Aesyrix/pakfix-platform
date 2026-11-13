'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, ShieldBan } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { LocaleToggle } from '@/components/i18n/LocaleToggle';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { formatWhen } from '@/components/jobs/JobParts';
import { errorText } from '@/components/jobs/JobDialogs';
import { ModeToggle } from '@/components/theme/ModeToggle';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { safetyApi } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';

/**
 * The website's version of the app's Account screen: language, appearance,
 * blocked people, the legal pages and deleting the account.
 */
export function SettingsPanel() {
  const t = useAppText();
  const links: Array<[string, string]> = [
    ['/contact', t('accountHelp')],
    ['/terms-of-service', t('accountTerms')],
    ['/privacy-policy', t('accountPrivacy')],
    ['/refund-policy', t('accountRefunds')],
    ['/community-guidelines', t('accountCommunity')],
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">{t('accountLanguage')}</span>
            <LocaleToggle />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <span className="font-semibold">{t('accountTheme')}</span>
            <ModeToggle />
          </div>
        </CardBody>
      </Card>

      <BlockedPeople />

      <Card>
        <ul className="divide-y divide-line">
          {links.map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="flex items-center justify-between px-5 py-3.5 text-sm font-medium hover:bg-surface-muted">
                {label}
                <ChevronRight className="h-4 w-4 text-ink-400 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li>
            <Link href="/delete-account" className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-danger-600 hover:bg-danger-50">
              {t('accountDelete')}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}

function BlockedPeople() {
  const t = useAppText();
  const { locale } = useLocale();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['blocked-people'], queryFn: safetyApi.blocked });

  async function unblock(userId: string) {
    setBusy(userId);
    try {
      await safetyApi.unblockPerson(userId);
      toast.success(t('sfUnblocked'));
      void queryClient.invalidateQueries({ queryKey: ['blocked-people'] });
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <ShieldBan className="h-4 w-4 text-ink-500" aria-hidden="true" />
          {t('sfBlockedPeople')}
        </h2>
        {query.isPending ? null : !query.data || query.data.length === 0 ? (
          <p className="text-sm text-ink-500">{t('sfBlockedEmpty')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {query.data.map((person) => (
              <li key={person.user_id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-ink-500">{t('sfBlockedSince', { date: formatWhen(person.blocked_at, locale) })}</p>
                </div>
                <Button size="sm" variant="secondary" loading={busy === person.user_id} onClick={() => unblock(person.user_id)}>
                  {t('sfUnblock')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
