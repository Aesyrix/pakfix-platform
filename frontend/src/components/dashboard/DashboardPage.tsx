'use client';

import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

/**
 * The shared furniture every account page uses, so a page is a title, an
 * action and a body rather than a fresh layout each time.
 */
export function PageHeader({
  eyebrow,
  eyebrowUr,
  title,
  titleUr,
  description,
  descriptionUr,
  action,
}: {
  eyebrow?: string;
  eyebrowUr?: string;
  title: string;
  titleUr?: string;
  description?: string;
  descriptionUr?: string;
  action?: ReactNode;
}) {
  const t = useT();

  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <span className="eyebrow">
            {t(eyebrow, eyebrowUr)}
          </span>
        ) : null}
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
          {t(title, titleUr)}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{t(description, descriptionUr)}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({
  children,
  urdu,
  className,
}: {
  children: string;
  urdu?: string;
  className?: string;
}) {
  const t = useT();
  return (
    <h2 className={cn('text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-500', className)}>
      {t(children, urdu)}
    </h2>
  );
}

/** A single figure on an overview screen. */
export function StatTile({
  icon,
  label,
  labelUr,
  value,
  hint,
  hintUr,
  tone = 'neutral',
}: {
  icon: ReactNode;
  label: string;
  labelUr?: string;
  value: string;
  hint?: string;
  hintUr?: string;
  tone?: 'neutral' | 'brand' | 'info' | 'warn';
}) {
  const t = useT();

  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted',
        tone === 'brand' && 'bg-gradient-to-br from-brand-50 via-surface to-surface border-brand-200/70',
        tone === 'warn' && 'border-warn-200 bg-gradient-to-br from-warn-50 via-surface to-surface'
      )}
    >
      <div className="flex items-center gap-2 text-ink-500">
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-surface-muted text-ink-500 ring-1 ring-inset ring-line',
            tone === 'brand' && 'bg-brand-100 text-brand-700',
            tone === 'info' && 'bg-accent-100 text-accent-800',
            tone === 'warn' && 'bg-warn-100 text-warn-700'
          )}
        >
          {icon}
        </span>
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]">{t(label, labelUr)}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] tabular-nums text-foreground">{value}</p>
      {hint ? (
        <p className="mt-0.5 text-[11px] font-medium text-ink-500">{t(hint, hintUr)}</p>
      ) : null}
    </div>
  );
}
