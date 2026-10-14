'use client';

import { cn } from '@/lib/utils/cn';
import { useT } from '@/components/i18n/LocaleProvider';

interface PakFixLogoProps {
  className?: string;
  showWordmark?: boolean;
  isDarkBackground?: boolean;
}

/**
 * PakFix Logo Component
 * Incorporates:
 * - Strong dark wordmark ('Pak' in dark, 'Fix' in #00824A green)
 * - House roof + Wrench icon symbol
 * - Crescent / star Pakistan visual identity element
 */
export function PakFixLogo({ className, showWordmark = true, isDarkBackground = false }: PakFixLogoProps) {
  const t = useT();

  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        className="h-9 w-auto shrink-0 drop-shadow-xs"
        role="img"
        aria-label={t('PakFix logo', 'پاک فکس لوگو')}
      >
        {/* Rounded Container Box */}
        <rect width="36" height="36" rx="10" className="fill-[#00824A]" />
        
        {/* House Roofline */}
        <path
          d="M8 17L18 8.5L28 17"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* House Walls */}
        <path
          d="M10.5 17V26A1.5 1.5 0 0 0 12 27.5H24A1.5 1.5 0 0 0 25.5 26V17"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Wrench Symbol inside house */}
        <path
          d="M16 19.5L20 23.5M19 16.5A2.2 2.2 0 1 0 16.5 19L19 16.5Z"
          stroke="#F4FBF7"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="white"
        />

        {/* Crescent Star Pakistan Identity accent */}
        <circle cx="25.5" cy="10.5" r="3.5" fill="#F59E0B" opacity="0.95" />
        <path
          d="M26.2 9.2L26.7 10.4L27.9 10.5L27 11.3L27.3 12.5L26.2 11.8L25.1 12.5L25.4 11.3L24.5 10.5L25.7 10.4L26.2 9.2Z"
          fill="white"
        />
      </svg>

      {showWordmark ? (
        <span className="flex items-baseline" dir="ltr">
          <span
            className={cn(
              'text-xl font-extrabold tracking-tight',
              isDarkBackground ? 'text-white' : 'text-[#161616]'
            )}
          >
            Pak
          </span>
          <span
            className={cn(
              'text-xl font-extrabold tracking-tight',
              // The action green is unreadable on a dark panel (3.7:1); the
              // on-dark green reads at 10.4:1.
              isDarkBackground ? 'text-[#4ADE80]' : 'text-[#00824A]'
            )}
          >
            Fix
          </span>
          <span
            className={cn(
              'text-xs font-semibold ml-0.5',
              isDarkBackground ? 'text-gray-300' : 'text-[#667085]'
            )}
          >
            .pk
          </span>
        </span>
      ) : null}
    </span>
  );
}
