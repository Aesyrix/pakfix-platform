import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The only button in PakFix.
 *
 * Every size meets the 44px touch target the mobile app needs, including the
 * small variant -- "small" changes the visual weight, not the tap area.
 */
const button = cva(
  [
    'inline-flex items-center justify-center gap-2 font-semibold',
    'rounded-[var(--radius-control)] transition-all duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00824A]',
    'min-h-[44px] touch-manipulation select-none cursor-pointer',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-[#00824A] text-white hover:bg-[#15803D] active:bg-[#166534] shadow-sm hover:shadow transition-all',
        accent:
          'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] shadow-sm hover:shadow transition-all',
        secondary:
          'bg-surface text-foreground border border-[var(--border)] hover:bg-surface-muted hover:border-ink-300',
        outline:
          'bg-transparent text-[#00824A] border-2 border-[#00824A] hover:bg-brand-50 hover:text-[#15803D]',
        ghost: 'bg-transparent text-foreground hover:bg-surface-muted',
        danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B]',
        link: 'bg-transparent text-[#00824A] underline underline-offset-4 hover:text-[#15803D] min-h-0 p-0',
      },
      size: {
        sm: 'h-11 px-4 text-sm',
        md: 'h-12 px-5 text-sm',
        lg: 'h-14 px-7 text-base font-bold',
        icon: 'h-11 w-11 p-0',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  }
);

type ButtonBaseProps = VariantProps<typeof button> & {
  /** Replaces the label with a spinner and blocks further presses. */
  loading?: boolean;
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonBaseProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, loading = false, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(button({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

export interface ButtonLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'className'>,
    VariantProps<typeof button> {
  className?: string;
}

/** A link that looks like a button. Stays an anchor, so it is still a link. */
export function ButtonLink({
  className,
  variant,
  size,
  block,
  ...props
}: ButtonLinkProps) {
  return <Link className={cn(button({ variant, size, block }), className)} {...props} />;
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
