'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { MegaMenu } from '@/components/layout/MegaMenu';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

interface NavLinkItem {
  href: string;
  label: string;
  isMega?: boolean;
  highlight?: boolean;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '/services', label: 'Services', isMega: true },
  { href: '/ai', label: 'AI Diagnosis', highlight: true },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/find-a-technician', label: 'Find a Pro' },
  { href: '/home-maintenance', label: 'Home Maintenance' },
  { href: '/become-a-technician', label: 'For Professionals' },
  { href: '/resources', label: 'Resources' },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const initialising = useAuthStore((state) => state.initialising);

  // Close menus on navigation. Adjusted during render rather than in an
  // effect: an effect renders the new page with the menu still open, then
  // immediately renders again to close it.
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMobileOpen(false);
    setMegaOpen(false);
  }

  // Click outside to close mega menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Slim Top Utility Bar */}
      <TopUtilityBar />

      {/* Main Header Navigation Bar */}
      <div className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md shadow-xs relative">
        <Container>
          <div className="flex h-[74px] items-center justify-between gap-4">
            {/* LEFT: PakFix Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group shrink-0"
              aria-label="PakFix home page"
            >
              <PakFixLogo className="h-9 w-auto transition-transform group-hover:scale-[1.02]" />
            </Link>

            {/* CENTER NAVIGATION (Desktop) */}
            <nav
              aria-label="Main Navigation"
              className="hidden lg:flex items-center gap-1 xl:gap-2"
              ref={megaMenuRef}
            >
              {NAV_LINKS.map((link) => {
                if (link.isMega) {
                  return (
                    <div key={link.href} className="relative">
                      <button
                        type="button"
                        onClick={() => setMegaOpen(!megaOpen)}
                        onMouseEnter={() => setMegaOpen(true)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all cursor-pointer',
                          megaOpen || pathname.startsWith('/services')
                            ? 'bg-[#EAF7F0] text-[#006838]'
                            : 'text-[#475467] hover:bg-[#F8FAF9] hover:text-[#161616]'
                        )}
                        aria-expanded={megaOpen}
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            megaOpen ? 'rotate-180 text-[#008A4B]' : 'text-[#667085]'
                          )}
                        />
                      </button>

                      {megaOpen ? <MegaMenu onClose={() => setMegaOpen(false)} /> : null}
                    </div>
                  );
                }

                const isActive = pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-[#EAF7F0] text-[#006838]'
                        : link.highlight
                        ? 'text-[#2563EB] hover:bg-[#EFF6FF]'
                        : 'text-[#475467] hover:bg-[#F8FAF9] hover:text-[#161616]'
                    )}
                  >
                    {link.highlight ? <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" /> : null}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT CTAs (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {initialising ? (
                <div className="skeleton h-10 w-36" />
              ) : user ? (
                <ButtonLink href={user.home_path ?? '/dashboard'} variant="primary" size="sm">
                  Dashboard
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink
                    href="/login"
                    variant="ghost"
                    size="sm"
                    className="text-[#475467] hover:text-[#161616] font-semibold"
                  >
                    Sign In
                  </ButtonLink>
                  <ButtonLink
                    href="/ai"
                    size="sm"
                    className="bg-[#008A4B] hover:bg-[#007541] text-white font-semibold rounded-xl px-5 py-2.5 shadow-xs"
                  >
                    Get Started
                  </ButtonLink>
                </>
              )}
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <div className="flex items-center gap-2 lg:hidden">
              {!user && (
                <ButtonLink
                  href="/ai"
                  size="sm"
                  className="bg-[#008A4B] text-white px-3.5 py-1.5 text-xs font-semibold rounded-lg"
                >
                  Get Started
                </ButtonLink>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl text-[#161616] hover:bg-[#F8FAF9] cursor-pointer"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </Container>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileOpen ? (
          <div className="border-t border-[#E5E7EB] bg-white shadow-2xl lg:hidden animate-in slide-in-from-top-2 duration-200">
            <Container className="py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors',
                    pathname.startsWith(link.href)
                      ? 'bg-[#EAF7F0] text-[#006838] font-bold'
                      : 'text-[#161616] hover:bg-[#F8FAF9]'
                  )}
                >
                  <span>{link.label}</span>
                  {link.highlight ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB]">
                      AI Diagnostic
                    </span>
                  ) : null}
                </Link>
              ))}

              <div className="pt-4 border-t border-[#E5E7EB] flex flex-col gap-2.5">
                {user ? (
                  <ButtonLink href={user.home_path ?? '/dashboard'} block>
                    Go to Dashboard
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink
                      href="/ai"
                      block
                      className="bg-[#008A4B] text-white font-bold py-3 text-center rounded-xl"
                    >
                      Diagnose My Problem
                    </ButtonLink>
                    <ButtonLink
                      href="/login"
                      variant="secondary"
                      block
                      className="border-[#E5E7EB] text-[#161616] font-semibold py-3 text-center rounded-xl"
                    >
                      Sign In
                    </ButtonLink>
                  </>
                )}
              </div>
            </Container>
          </div>
        ) : null}
      </div>
    </header>
  );
}
