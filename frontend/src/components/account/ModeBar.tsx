'use client';

import { Repeat } from 'lucide-react';
import Link from 'next/link';
import { useAppText } from '@/lib/i18n/app-text';
import { useAuthStore } from '@/stores/auth';

/**
 * Shown to a professional using Customer mode (booking help for themselves),
 * with the way back to Pro mode, as in the app's Account screen.
 */
export function ProModeBar() {
  const t = useAppText();
  const user = useAuthStore((state) => state.user);
  if (!user?.roles.includes('technician')) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line bg-brand-50 px-4 py-2 text-sm text-brand-800">
      <span>{t('accountCustomerModeBody')}</span>
      <Link href="/pro" className="inline-flex shrink-0 items-center gap-1.5 font-semibold hover:underline">
        <Repeat className="h-4 w-4" aria-hidden="true" />
        {t('accountProMode')}
      </Link>
    </div>
  );
}
