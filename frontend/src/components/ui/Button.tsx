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
    'rounded-[var(--radius-control)] transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    // Touch target, without forcing the visual height.
    'min-h-11 touch-manipulation select-none',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[var(--shadow-card)]',
        accent:
          'bg-accent-500 text-ink-950 hover:bg-accent-600 active:bg-accent-700 shadow-[var(--shadow-card)]',
        secondary:
          'bg-surface text-foreground border border-[var(--border)] hover:bg-surface-muted',
        ghost: 'bg-transparent text-foreground hover:bg-surface-muted',
        danger: 'bg-danger-600 text-white hover:bg-danger-500 active:bg-danger-600',
        link: 'bg-transparent text-brand-600 underline underline-offset-4 hover:text-brand-700 min-h-0',
      },
      size: {
        sm: 'h-11 px-3.5 text-sm',
        md: 'h-12 px-5 text-sm',
        lg: 'h-14 px-7 text-base',
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
