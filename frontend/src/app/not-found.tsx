import { Home, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * Exported as 404.html by the static build, and served with a 404 status by
 * Laravel for any unknown URL. It lives outside the (marketing) group so it
 * can render without that layout's data fetching -- a 404 must work even when
 * the API is unreachable.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main id="main" className="flex flex-1 items-center">
        <Container size="narrow" className="py-16 text-center sm:py-24">
          <p className="text-sm font-bold uppercase tracking-widest text-[#16A34A]">404</p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            We could not find that page
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-ink-600">
            The link may be out of date, or the page may have moved. Here is where most people go next.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/" size="lg">
              <Home className="h-4 w-4" aria-hidden="true" />
              Go to the homepage
            </ButtonLink>
            <ButtonLink href="/ai" variant="secondary" size="lg">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Describe a problem
            </ButtonLink>
          </div>

          <nav aria-label="Popular pages" className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {[
                { href: '/services', label: 'All services' },
                { href: '/find-a-technician', label: 'Find a professional' },
                { href: '/blog', label: 'Home guides' },
                { href: '/pricing', label: 'Prices' },
                { href: '/contact', label: 'Contact us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-surface px-4 text-sm font-medium hover:border-[#16A34A] hover:text-[#15803D]"
                  >
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    {link.label}
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
