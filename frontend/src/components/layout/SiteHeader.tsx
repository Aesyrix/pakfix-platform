'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/find-a-technician', label: 'Find a professional' },
  { href: '/become-a-technician', label: 'For professionals' },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const initialising = useAuthStore((state) => state.initialising);

  // A navigation should never leave the menu hanging open behind the new page.
  // Adjusted during render rather than in an effect: an effect would render
  // the new page with the menu still open and then immediately render again.
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-surface/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" aria-label="PakFix home">
            <PakFixLogo className="h-8 w-auto" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-surface-muted hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {initialising ? (
              <div className="skeleton h-11 w-40" />
            ) : user ? (
              <ButtonLink href={user.home_path ?? '/dashboard'} variant="primary" size="sm">
                Go to dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/ai" variant="primary" size="sm">
                  Diagnose my problem
                </ButtonLink>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </Container>

      {open ? (
        <div id="mobile-menu" className="border-t border-[var(--border)] bg-surface lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-control)] px-3 py-3 text-base font-medium text-foreground hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <ButtonLink href={user.home_path ?? '/dashboard'} block>
                  Go to dashboard
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/ai" block>
                    Diagnose my problem
                  </ButtonLink>
                  <ButtonLink href="/login" variant="secondary" block>
                    Sign in
                  </ButtonLink>
                </>
              )}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
