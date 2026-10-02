'use client';

import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircleQuestion,
  Newspaper,
  Quote,
  Settings,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import { useToast } from '@/components/ui/Toast';
import { adminApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

/**
 * The admin shell.
 *
 * Navigation is built from the permissions the API reports, so a support
 * agent sees the inbox and nothing else. This is for clarity only -- every
 * one of these screens is authorised again by Laravel on each request.
 */
interface AdminLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: 'content' | 'blog' | 'services' | 'settings' | 'inbox' | null;
  exact?: boolean;
}

const LINKS: AdminLink[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, permission: null, exact: true },
  { href: '/admin/content', label: 'Homepage', icon: LayoutDashboard, permission: 'content' },
  { href: '/admin/faqs', label: 'FAQs', icon: MessageCircleQuestion, permission: 'content' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote, permission: 'content' },
  { href: '/admin/pages', label: 'Pages', icon: FileText, permission: 'content' },
  { href: '/admin/blog', label: 'Guides', icon: Newspaper, permission: 'blog' },
  { href: '/admin/services', label: 'Services', icon: Wrench, permission: 'services' },
  { href: '/admin/inbox', label: 'Contact inbox', icon: Inbox, permission: 'inbox' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const overview = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.overview, staleTime: 30_000 });
  const permissions = overview.data?.permissions;
  const unhandled = overview.data?.inbox.unhandled_contact_messages ?? 0;

  const visible = LINKS.filter((link) => !link.permission || permissions?.[link.permission]);

  async function signOut() {
    await logout();
    toast.success('Signed out.');
    router.push('/');
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-surface">
        <Container size="wide">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="PakFix home">
                <PakFixLogo className="h-8" />
              </Link>
              <Badge tone="neutral">Admin</Badge>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-ink-600 sm:inline">{user?.name}</span>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-3 text-sm font-medium text-ink-600 hover:bg-surface-muted hover:text-danger-600"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </Container>
      </header>

      <Container size="wide" className="flex flex-col gap-6 py-6 lg:flex-row">
        <nav aria-label="Admin sections" className="lg:w-56 lg:shrink-0">
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {visible.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-[var(--radius-control)] px-3 text-sm font-medium transition-colors',
                      active ? 'bg-[#DCFCE7] text-[#15803D]' : 'text-ink-600 hover:bg-surface-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {link.label}
                    {link.permission === 'inbox' && unhandled > 0 ? (
                      <span className="ml-auto rounded-full bg-[#DC2626] px-1.5 py-0.5 text-[0.6875rem] font-bold text-white">
                        {unhandled}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </Container>
    </div>
  );
}

/** Heading plus optional action for an admin screen. */
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-ink-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
