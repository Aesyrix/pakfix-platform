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
import { LocaleToggle } from '@/components/i18n/LocaleToggle';
import { ModeToggle } from '@/components/theme/ModeToggle';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

import { useT } from '@/components/i18n/LocaleProvider';

interface NavLinkItem {
  href: string;
  en: string;
  ur: string;
  isMega?: boolean;
  highlight?: boolean;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '/services', en: 'Services', ur: 'خدمات', isMega: true },
  { href: '/ai', en: 'AI Diagnosis', ur: 'اے آئی تشخیص', highlight: true },
  { href: '/how-it-works', en: 'How It Works', ur: 'یہ کیسے کام کرتا ہے' },
  { href: '/find-a-technician', en: 'Find a Pro', ur: 'پروفیشنل تلاش کریں' },
  { href: '/home-maintenance', en: 'Home Maintenance', ur: 'گھر کی دیکھ بھال' },
  { href: '/become-a-technician', en: 'For Professionals', ur: 'پروفیشنلز کے لیے' },
  { href: '/blog', en: 'Resources', ur: 'رہنمائی' },
];

export function SiteHeader() {
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // There is a gap between the "Services" trigger and the panel (which starts at
  // the bottom of the header bar). Closing on mouseleave fires while the pointer
  // is still crossing that gap, so the panel would vanish before it can be used.
  // Delay the close just long enough for the pointer to reach the panel.
  const cancelMegaClose = () => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
  };

  const openMega = () => {
    cancelMegaClose();
    setMegaOpen(true);
  };

  const closeMegaSoon = () => {
    cancelMegaClose();
    megaCloseTimer.current = setTimeout(() => {
      megaCloseTimer.current = null;
      setMegaOpen(false);
    }, 200);
  };

  useEffect(() => () => cancelMegaClose(), []);

  // A soft shadow once the page scrolls, so the bar lifts off the content.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <div
        className={cn(
          'relative border-b bg-surface/80 backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,border-color] duration-300',
          scrolled ? 'border-line/70 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)]' : 'border-transparent'
        )}
      >
        {/* Emerald hairline along the bottom edge */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
        <Container size="wide">
          <div className="flex h-[74px] items-center justify-between gap-4">
            {/* LEFT: PakFix Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group shrink-0"
              aria-label={t('PakFix home page', 'پاک فکس ہوم پیج')}
            >
              <PakFixLogo className="h-9 w-auto transition-transform group-hover:scale-[1.02]" />
            </Link>

            {/* CENTER NAVIGATION (Desktop) */}
            <nav
              aria-label={t('Main Navigation', 'مرکزی نیویگیشن')}
              className="hidden xl:flex items-center gap-0.5 rounded-full border border-line/70 bg-surface-muted/70 p-1"
              ref={megaMenuRef}
            >
              {NAV_LINKS.map((link) => {
                if (link.isMega) {
                  return (
                    <div
                      key={link.href}
                      onMouseEnter={openMega}
                      onMouseLeave={closeMegaSoon}
                    >
                      <button
                        type="button"
                        onClick={() => setMegaOpen(!megaOpen)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer',
                          megaOpen || pathname.startsWith('/services')
                            ? 'bg-surface text-brand-700 shadow-xs ring-1 ring-line/70'
                            : 'text-ink-600 hover:bg-surface hover:text-ink-900'
                        )}
                        aria-expanded={megaOpen}
                      >
                        <span>{t(link.en, link.ur)}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            megaOpen ? 'rotate-180 text-brand-600' : 'text-ink-500'
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
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all',
                      isActive
                        ? 'bg-surface text-brand-700 shadow-xs ring-1 ring-line/70'
                        : link.highlight
                        ? 'text-accent-600 hover:bg-surface'
                        : 'text-ink-600 hover:bg-surface hover:text-ink-900'
                    )}
                  >
                    {link.highlight ? <Sparkles className="h-3.5 w-3.5 text-accent-600" /> : null}
                    <span>{t(link.en, link.ur)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT CTAs (Desktop) */}
            <div className="hidden xl:flex items-center gap-2 shrink-0">
              <ModeToggle />
              {initialising ? (
                <div className="skeleton h-10 w-36" />
              ) : user ? (
                <ButtonLink href={user.home_path ?? '/dashboard'} variant="primary" size="sm">
                  {t('Dashboard', 'ڈیش بورڈ')}
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink
                    href="/login"
                    variant="ghost"
                    size="sm"
                    className="text-ink-600 hover:text-ink-900 font-semibold"
                  >
                    {t('Sign In', 'سائن اِن')}
                  </ButtonLink>
                  <ButtonLink
                    href="/register"
                    size="sm"
                    className="px-5 rounded-full shadow-md shadow-brand-500/25 hover:-translate-y-px"
                  >
                    {t('Get Started', 'شروع کریں')}
                  </ButtonLink>
                </>
              )}
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <div className="flex items-center gap-2 xl:hidden">
              {!user && (
                <ButtonLink
                  href="/register"
                  size="sm"
                  className="bg-brand-solid text-white px-3.5 py-1.5 text-xs font-semibold rounded-full shadow-sm shadow-brand-500/25"
                >
                  {t('Get Started', 'شروع کریں')}
                </ButtonLink>
              )}

              <ModeToggle />
              <LocaleToggle className="sm:hidden" />

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl text-ink-900 hover:bg-surface-muted cursor-pointer"
                aria-label={mobileOpen ? t('Close menu', 'مینو بند کریں') : t('Open menu', 'مینو کھولیں')}
              >                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </Container>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileOpen ? (
          <div className="border-t border-line bg-surface/95 backdrop-blur-xl shadow-2xl xl:hidden max-h-[calc(100dvh-74px)] overflow-y-auto">
            <Container className="py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors',
                    pathname.startsWith(link.href)
                      ? 'bg-brand-50 text-brand-700 font-semibold ring-1 ring-brand-100'
                      : 'text-ink-900 hover:bg-surface-muted'
                  )}
                >
                  <span>{t(link.en, link.ur)}</span>
                  {link.highlight ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-50 text-accent-600 ring-1 ring-accent-100">
                      {t('AI Diagnostic', 'اے آئی تشخیص')}
                    </span>
                  ) : null}
                </Link>
              ))}

              <div className="pt-4 border-t border-line flex flex-col gap-2.5">
                {user ? (
                  <ButtonLink href={user.home_path ?? '/dashboard'} block>
                    {t('Go to Dashboard', 'ڈیش بورڈ پر جائیں')}
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink
                      href="/ai"
                      block
                      className="bg-brand-solid text-white font-bold py-3 text-center rounded-xl"
                    >
                      {t('Diagnose My Problem', 'میرا مسئلہ تشخیص کریں')}
                    </ButtonLink>
                    <ButtonLink
                      href="/login"
                      variant="secondary"
                      block
                      className="border-line text-ink-900 font-semibold py-3 text-center rounded-xl"
                    >
                      {t('Sign In', 'سائن اِن')}
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
