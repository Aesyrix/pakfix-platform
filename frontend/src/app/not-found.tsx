'use client';

import { Home, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { useT } from '@/components/i18n/LocaleProvider';

/**
 * Exported as 404.html by the static build, and served with a 404 status by
 * Laravel for any unknown URL. It lives outside the (marketing) group so it
 * can render without that layout's data fetching -- a 404 must work even when
 * the API is unreachable.
 */
export default function NotFound() {
  const t = useT();

  const links = [
    { href: '/services', en: 'All services', ur: 'تمام خدمات' },
    { href: '/find-a-technician', en: 'Find a professional', ur: 'پروفیشنل تلاش کریں' },
    { href: '/blog', en: 'Home guides', ur: 'گھریلو گائیڈز' },
    { href: '/pricing', en: 'Prices', ur: 'قیمتیں' },
    { href: '/contact', en: 'Contact us', ur: 'ہم سے رابطہ کریں' },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main id="main" className="relative isolate flex flex-1 items-center overflow-hidden">
        {/* Glow and dot grid; purely decorative. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-10 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(var(--color-ink-200)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        </div>
        <Container size="narrow" className="py-16 text-center sm:py-24">
          <p aria-hidden="true" className="text-gradient-brand font-display text-[7rem] font-bold leading-none tracking-[-0.04em] sm:text-[10rem]">404</p>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            {t('We could not find that page', 'ہمیں وہ صفحہ نہیں مل سکا')}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-ink-600">
            {t(
              'The link may be out of date, or the page may have moved. Here is where most people go next.',
              'ہو سکتا ہے لنک پرانا ہو، یا صفحہ منتقل ہو گیا ہو۔ زیادہ تر لوگ یہاں سے آگے جاتے ہیں۔'
            )}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/" size="lg">
              <Home className="h-4 w-4" aria-hidden="true" />
              {t('Go to the homepage', 'ہوم پیج پر جائیں')}
            </ButtonLink>
            <ButtonLink href="/ai" variant="secondary" size="lg">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t('Describe a problem', 'مسئلہ بیان کریں')}
            </ButtonLink>
          </div>

          <nav aria-label={t('Popular pages', 'مقبول صفحات')} className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-line bg-surface px-4 text-sm font-medium shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-md"
                  >
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    {t(link.en, link.ur)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </main>

      <SiteFooter bootstrap={null} popularCategories={[]} />
    </div>
  );
}
