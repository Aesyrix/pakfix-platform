'use client';

import { useT } from '@/components/i18n/LocaleProvider';

/** First stop for a keyboard user on every page. */
export function SkipLink() {
  const t = useT();

  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-control)] focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
    >
      {t('Skip to content', 'مواد پر جائیں')}
    </a>
  );
}
