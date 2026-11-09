import { ShieldCheck } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-ink-600 border border-line',
        brand: 'bg-brand-50 text-brand-700 border border-brand-200',
        safe: 'bg-brand-50 text-brand-700 border border-brand-200',
        warn: 'bg-warn-50 text-warn-700 border border-warn-200',
        danger: 'bg-danger-50 text-danger-700 border border-danger-200',
        info: 'bg-accent-50 text-accent-700 border border-accent-200',
        accent: 'bg-accent-50 text-accent-800 border border-accent-200',
        verified: 'bg-gradient-to-r from-brand-50 to-accent-50 text-brand-900 border border-brand-200',
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

export function VerifiedBadge({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span
      title="Identity and documents verified by PakFix"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-50 to-accent-50 px-2.5 py-1 text-xs font-bold text-brand-900 border border-brand-200 shadow-xs cursor-help',
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-brand-600 shrink-0" aria-hidden="true" />
      {showText ? <span>Verified Pro</span> : null}
    </span>
  );
}
