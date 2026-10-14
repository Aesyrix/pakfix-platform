'use client';

import { CalendarCheck, Home, MessageCircle, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

/**
 * The mobile bottom bar. This is what makes the customer app feel native on a
 * phone: five destinations, always reachable with a thumb, sitting above the
 * iOS home indicator.
 *
 * Hidden from large screens, where the sidebar takes over.
 */
const ITEMS = [
  { href: '/dashboard', label: 'Home', labelUr: 'ہوم', icon: Home },
  { href: '/ai', label: 'Ask AI', labelUr: 'اے آئی سے پوچھیں', icon: Sparkles },
  { href: '/dashboard/bookings', label: 'Bookings', labelUr: 'بکنگ', icon: CalendarCheck },
  { href: '/dashboard/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle },
  { href: '/dashboard/profile', label: 'Profile', labelUr: 'پروفائل', icon: User },
] as const;

export function BottomNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t('Primary', 'بنیادی')}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-surface/95 backdrop-blur-md shadow-lg',
        'pb-[env(safe-area-inset-bottom,0px)] lg:hidden'
      )}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[0.6875rem] font-semibold transition-colors',
                  active ? 'text-[#00824A]' : 'text-ink-500 hover:text-foreground'
                )}
              >
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#00824A]" />
                )}
                <Icon
                  className={cn('h-5 w-5 transition-transform', active ? 'scale-110 stroke-[2.4]' : 'scale-100')}
                  aria-hidden="true"
                />
                <span className="leading-none">{t(item.label, item.labelUr)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
