'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LocaleToggle } from '@/components/i18n/LocaleToggle';
import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { NavItem } from '@/lib/dashboard/nav';

/**
 * The mobile bottom bar: five destinations, always reachable with a thumb,
 * sitting above the iOS home indicator. Hidden from large screens, where the
 * sidebar takes over.
 */
export function AppBottomNav({
  items,
  ariaLabel,
  ariaLabelUr,
}: {
  items: NavItem[];
  ariaLabel: string;
  ariaLabelUr?: string;
}) {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t(ariaLabel, ariaLabelUr)}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-surface/95 backdrop-blur-md shadow-lg',
        'pb-[env(safe-area-inset-bottom,0px)] lg:hidden'
      )}
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-center text-[0.6875rem] font-semibold transition-colors',
                  active ? 'text-[#00824A]' : 'text-ink-500 hover:text-foreground'
                )}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#00824A]" />}
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform',
                    active ? 'scale-110 stroke-[2.4]' : 'scale-100'
                  )}
                  aria-hidden="true"
                />
                <span className="leading-none">{t(item.label, item.labelUr)}</span>
              </Link>
            </li>
          );
        })}

        <li>
          <LocaleToggle className="h-full min-h-[60px] w-full flex-col justify-center gap-1 rounded-none px-1 text-[0.6875rem] font-semibold" />
        </li>
      </ul>
    </nav>
  );
}
