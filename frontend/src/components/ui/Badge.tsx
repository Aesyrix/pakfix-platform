import { ShieldCheck } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-ink-600 border border-[var(--border)]',
        brand: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]',
        safe: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]',
        warn: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
        danger: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]',
        info: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]',
        accent: 'bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]',
        verified: 'bg-gradient-to-r from-[#DCFCE7] to-[#DBEAFE] text-[#15803D] border border-[#86EFAC]',
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
        'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#DCFCE7] to-[#DBEAFE] px-2.5 py-1 text-xs font-bold text-[#15803D] border border-[#86EFAC] shadow-xs cursor-help',
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A] shrink-0" aria-hidden="true" />
      {showText ? <span>Verified Pro</span> : null}
    </span>
  );
}
