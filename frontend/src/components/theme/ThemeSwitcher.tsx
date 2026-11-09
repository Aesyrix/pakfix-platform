'use client';

import { Check, Moon, Palette, Sun } from 'lucide-react';
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { useT } from '@/components/i18n/LocaleProvider';
import {
  applyMode,
  applyTheme,
  getModeSnapshot,
  getServerModeSnapshot,
  getServerThemeSnapshot,
  getThemeSnapshot,
  subscribeMode,
  subscribeTheme,
  THEMES,
  type ThemeId,
} from '@/lib/theme';
import { cn } from '@/lib/utils/cn';

/**
 * The colour-theme picker: a small button that opens a list of themes, each
 * with a swatch. Used in the marketing utility bar, footer, sign-in pages and
 * the signed-in shells, so it looks right on light and dark backgrounds.
 */
export function ThemeSwitcher({
  onDark = false,
  align = 'end',
  placement = 'below',
  className,
}: {
  onDark?: boolean;
  align?: 'start' | 'end';
  placement?: 'below' | 'above';
  className?: string;
}) {
  const t = useT();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  // The init script has already applied the saved theme before paint.
  const current = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const mode = useSyncExternalStore(subscribeMode, getModeSnapshot, getServerModeSnapshot);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function choose(id: ThemeId) {
    applyTheme(id);
    setOpen(false);
  }

  const active = THEMES.find((theme) => theme.id === current) ?? THEMES[0];

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('Change colour theme', 'رنگوں کا انداز تبدیل کریں')}
        className={cn(
          'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 text-xs font-semibold transition-colors',
          onDark ? 'text-ink-300 hover:bg-surface/10 hover:text-white' : 'text-ink-600 hover:bg-surface-muted hover:text-foreground'
        )}
      >
        <Palette className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t(active.name, active.nameUr)}</span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="group"
          aria-label={t('Colour themes', 'رنگوں کے انداز')}
          className={cn(
            'absolute z-50 w-64 rounded-2xl border border-line bg-surface p-1.5 text-ink-900 shadow-floating',
            align === 'end' ? 'end-0' : 'start-0',
            placement === 'below' ? 'top-full mt-2' : 'bottom-full mb-2'
          )}
        >
          <p className="px-2.5 pb-1.5 pt-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-500">
            {t('Appearance', 'ظاہری انداز')}
          </p>
          <div className="mx-1 mb-2 grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
            {(['light', 'dark'] as const).map((value) => {
              const Icon = value === 'light' ? Sun : Moon;
              const selected = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => applyMode(value)}
                  aria-pressed={selected}
                  className={cn(
                    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all',
                    selected ? 'bg-surface text-foreground shadow-sm' : 'text-ink-500 hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {value === 'light' ? t('Light', 'روشن') : t('Dark', 'تاریک')}
                </button>
              );
            })}
          </div>
          <p className="px-2.5 pb-1 pt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-500">
            {t('Colour theme', 'رنگوں کا انداز')}
          </p>
          <ul>
            {THEMES.map((theme) => {
              const selected = theme.id === current;
              return (
                <li key={theme.id}>
                  <button
                    type="button"
                    onClick={() => choose(theme.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-start transition-colors',
                      selected ? 'bg-surface-muted' : 'hover:bg-surface-muted'
                    )}
                  >
                    <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                      {theme.swatch.map((colour) => (
                        <span key={colour} className="h-5 w-5 rounded-full ring-2 ring-surface" style={{ backgroundColor: colour }} />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{t(theme.name, theme.nameUr)}</span>
                      <span className="block truncate text-xs text-ink-500">{t(theme.description, theme.descriptionUr)}</span>
                    </span>
                    {selected ? <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
