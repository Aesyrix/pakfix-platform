import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import type { Bootstrap, ServiceCategory } from '@/lib/api/types';

const FOOTER_SECTIONS = [
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    heading: 'Work with us',
    links: [
      { href: '/become-a-technician', label: 'Become a professional' },
      { href: '/for-service-companies', label: 'For service companies' },
      { href: '/for-property-managers', label: 'For property managers' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/terms-of-service', label: 'Terms' },
      { href: '/privacy-policy', label: 'Privacy' },
      { href: '/refund-policy', label: 'Refunds' },
      { href: '/safety', label: 'Safety' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
] as const;

/**
 * Contact details and the popular-service links come from the API, so
 * marketing can change them from the admin dashboard without a deploy.
 */
export function SiteFooter({
  bootstrap,
  popularCategories = [],
}: {
  bootstrap: Bootstrap | null;
  popularCategories?: ServiceCategory[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-surface">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <PakFixLogo className="h-8" />
            <p className="mt-4 max-w-sm text-sm text-ink-500">
              {bootstrap?.brand.tagline ?? 'Show the Problem. Get It Fixed.'}
            </p>

            {bootstrap ? (
              <div className="mt-5 flex flex-col gap-1.5 text-sm">
                <a
                  href={`mailto:${bootstrap.brand.support_email}`}
                  className="text-ink-600 hover:text-brand-600"
                >
                  {bootstrap.brand.support_email}
                </a>
                <a
                  href={`tel:${bootstrap.brand.support_phone.replace(/\s/g, '')}`}
                  className="text-ink-600 hover:text-brand-600"
                >
                  {bootstrap.brand.support_phone}
                </a>
              </div>
            ) : null}
          </div>

          {popularCategories.length > 0 ? (
            <div>
              <h2 className="text-sm font-semibold">Popular services</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {popularCategories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/services/${category.slug}`}
                      className="text-sm text-ink-500 hover:text-brand-600"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="text-sm font-semibold">{section.heading}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-500 hover:text-brand-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} PakFix. All rights reserved.</p>
          <p>Built for Pakistan. Prices in PKR.</p>
        </div>
      </Container>
    </footer>
  );
}
