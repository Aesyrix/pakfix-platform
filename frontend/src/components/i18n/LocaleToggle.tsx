'use client';

import { Globe } from 'lucide-react';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { localeLabel } from '@/lib/i18n';
import { cn } from '@/lib/utils/cn';

/**
 * The one language switch, used by every shell that is not the marketing
 * header (which has its own copy in `TopUtilityBar`). It shows the language the
 * tap will take you to, so the label always reads as the action, not the state.
 */
export function LocaleToggle({
  onDark = false,
  className,
}: {
  onDark?: boolean;
  className?: string;
}) {
  const t = useT();
  const { locale, toggleLocale } = useLocale();
  const next = locale === 'en' ? 'ur' : 'en';

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t('Switch language', 'زبان تبدیل کریں')}
      lang={next}
      className={cn(
        'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 text-xs font-semibold transition-colors',
        onDark
          ? 'text-gray-300 hover:bg-white/10 hover:text-white'
          : 'text-ink-600 hover:bg-surface-muted hover:text-foreground',
        className
      )}
    >
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{localeLabel(next)}</span>
    </button>
  );
}
