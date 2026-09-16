import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-ink-600',
        brand: 'bg-brand-50 text-brand-700',
        safe: 'bg-safe-500/12 text-safe-600',
        warn: 'bg-warn-500/15 text-warn-600',
        danger: 'bg-danger-500/12 text-danger-600',
        info: 'bg-info-500/12 text-info-500',
        accent: 'bg-accent-100 text-accent-800',
      },
    },
    defaultVariants: { tone: 'neutral' },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}
