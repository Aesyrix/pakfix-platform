import { cn } from '@/lib/utils/cn';

/**
 * The PakFix mark: a house outline whose roof doubles as a wrench head.
 * Drawn inline rather than loaded as an image so it inherits the current
 * colour and stays crisp at every size, including the favicon.
 */
export function PakFixLogo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="h-full w-auto shrink-0"
        role="img"
        aria-label="PakFix"
      >
        <rect width="32" height="32" rx="9" className="fill-brand-600" />
        {/* Roofline */}
        <path
          d="M7 15.5 16 8l9 7.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Walls */}
        <path
          d="M9.5 15.6V23a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7.4"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* The wrench head sitting where a door would be */}
        <circle cx="16" cy="18" r="2.1" className="fill-accent-400" />
        <path d="M16 20.1V24" stroke="var(--color-accent-400)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>

      {showWordmark ? (
        <span className="text-lg font-extrabold tracking-tight text-foreground">
          Pak<span className="text-brand-600">Fix</span>
        </span>
      ) : null}
    </span>
  );
}
