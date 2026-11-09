'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useT } from '@/components/i18n/LocaleProvider';
import { applyMode, getModeSnapshot, getServerModeSnapshot, subscribeMode } from '@/lib/theme';
import { cn } from '@/lib/utils/cn';

/** The light / dark switch: one icon button that shows what a tap will do. */
export function ModeToggle({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const t = useT();
  const mode = useSyncExternalStore(subscribeMode, getModeSnapshot, getServerModeSnapshot);
  const dark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={() => applyMode(dark ? 'light' : 'dark')}
      aria-label={dark ? t('Switch to light mode', 'روشن انداز') : t('Switch to dark mode', 'تاریک انداز')}
      title={dark ? t('Light mode', 'روشن انداز') : t('Dark mode', 'تاریک انداز')}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-control)] transition-colors',
        onDark ? 'text-ink-300 hover:bg-white/10 hover:text-white' : 'text-ink-600 hover:bg-surface-muted hover:text-foreground',
        className
      )}
    >
      {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
