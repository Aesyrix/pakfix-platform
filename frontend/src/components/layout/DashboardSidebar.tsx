'use client';

import {
  Bell,
  Building2,
  CalendarCheck,
  CreditCard,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/components/i18n/LocaleProvider';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

const SECTIONS = [
  {
    heading: null,
    headingUr: null,
    items: [
      { href: '/dashboard', label: 'Overview', labelUr: 'جائزہ', icon: LayoutDashboard, exact: true },
      { href: '/ai', label: 'Ask PakFix AI', labelUr: 'پاک فکس اے آئی سے پوچھیں', icon: Sparkles },
    ],
  },
  {
    heading: 'My home',
    headingUr: 'میرا گھر',
    items: [
      { href: '/dashboard/properties', label: 'Properties', labelUr: 'پراپرٹیز', icon: Building2 },
      { href: '/dashboard/maintenance', label: 'Maintenance', labelUr: 'دیکھ بھال', icon: Wrench },
    ],
  },
  {
    heading: 'Jobs',
    headingUr: 'کام',
    items: [
      { href: '/dashboard/bookings', label: 'Bookings', labelUr: 'بکنگ', icon: CalendarCheck },
      { href: '/dashboard/quotes', label: 'Quotes', labelUr: 'کوٹیشن', icon: FileText },
      { href: '/dashboard/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle },
    ],
  },
  {
    heading: 'Account',
    headingUr: 'اکاؤنٹ',
    items: [
      { href: '/dashboard/payments', label: 'Payments', labelUr: 'ادائیگیاں', icon: CreditCard },
      { href: '/dashboard/saved', label: 'Saved professionals', labelUr: 'محفوظ پروفیشنلز', icon: Heart },
      { href: '/dashboard/reviews', label: 'Reviews', labelUr: 'جائزے', icon: Star },
      { href: '/dashboard/notifications', label: 'Notifications', labelUr: 'اطلاعات', icon: Bell },
      { href: '/dashboard/settings', label: 'Settings', labelUr: 'ترتیبات', icon: Settings },
    ],
  },
] as const;

/** The desktop navigation. Replaced by the bottom bar below `lg`. */
export function DashboardSidebar() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  async function signOut() {
    await logout();
    toast.success(t('Signed out.', 'سائن آؤٹ ہو گئے۔'));
    router.push('/');
  }

  return (
    <aside className="hidden w-64 shrink-0 border-e border-[var(--border)] bg-surface lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/" aria-label={t('PakFix home', 'پاک فکس ہوم')}>
          <PakFixLogo className="h-8" />
        </Link>
      </div>

      <nav aria-label={t('Dashboard', 'ڈیش بورڈ')} className="flex-1 overflow-y-auto px-3 pb-6">
        {SECTIONS.map((section, index) => (
          <div key={section.heading ?? index} className={cn(index > 0 && 'mt-6')}>
            {section.heading ? (
              <h2 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                {t(section.heading, section.headingUr ?? undefined)}
              </h2>
            ) : null}

            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active =
                  'exact' in item && item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm font-medium transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-600 hover:bg-surface-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                      {t(item.label, item.labelUr)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-ink-500">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-danger-600"
        >
          <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
          {t('Sign out', 'سائن آؤٹ')}
        </button>
      </div>
    </aside>
  );
}
