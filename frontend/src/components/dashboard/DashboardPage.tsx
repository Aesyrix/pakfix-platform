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
          <span className="text-xs font-bold uppercase tracking-wider text-[#00824A]">
            {t(eyebrow, eyebrowUr)}
          </span>
        ) : null}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
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
    <h2 className={cn('text-sm font-bold uppercase tracking-wide text-ink-500', className)}>
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
        'rounded-[var(--radius-card)] border border-[var(--border)] bg-surface p-4 shadow-xs',
        tone === 'brand' && 'bg-gradient-to-br from-[#DCFCE7]/60 to-surface',
        tone === 'warn' && 'border-[#F59E0B]/40 bg-[#FEF3C7]/20'
      )}
    >
      <div className="flex items-center gap-2 text-ink-500">
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-surface-muted text-ink-500',
            tone === 'brand' && 'bg-[#DCFCE7] text-[#15803D]',
            tone === 'info' && 'bg-[#DBEAFE] text-[#1E40AF]',
            tone === 'warn' && 'bg-[#FEF3C7] text-[#B45309]'
          )}
        >
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wide">{t(label, labelUr)}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-foreground">{value}</p>
      {hint ? (
        <p className="mt-0.5 text-[11px] font-medium text-ink-500">{t(hint, hintUr)}</p>
      ) : null}
    </div>
  );
}
