import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * What a list looks like when it has nothing in it. The brief is explicit
 * that a blank screen is never acceptable, so every list renders one of
 * these instead, with a way forward rather than an apology.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)]',
        'border border-dashed border-[var(--border)] bg-surface px-6 py-12 text-center',
        className
      )}
    >
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-500">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
