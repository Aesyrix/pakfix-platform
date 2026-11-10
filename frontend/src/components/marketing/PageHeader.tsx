'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

export interface Crumb {
  name: string;
  href?: string;
}

/** Visible breadcrumbs. Pair with breadcrumbSchema() for the structured-data version. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const t = useT();

  return (
    <nav aria-label={t('Breadcrumb', 'بریڈ کرمب')} className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-ink-500">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-brand-600">
                  {item.name}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'text-foreground' : undefined}>
                  {item.name}
                </span>
              )}
              {!last ? <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The heading band at the top of every inner marketing page. */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  breadcrumbs,
  children,
  size = 'default',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
  size?: 'default' | 'narrow';
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-gradient-to-b from-brand-50 to-background">
      {/* Soft glow and dot grid; purely decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent-100/60 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-ink-200)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>
      <Container size={size} className="py-12 sm:py-20">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-5" /> : null}
        {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
        <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-[-0.022em] text-ink-900 sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-2xl text-pretty text-base text-ink-600 sm:text-lg">{subtitle}</p> : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </Container>
    </section>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children,
  muted = false,
  id,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  muted?: boolean;
  id?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn('py-14 sm:py-20', muted && 'bg-section-glow')}
    >
      <Container>
        {title || action ? (
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              {title ? (
                <h2 id={headingId} className="section-title text-ink-900">
                  {title}
                </h2>
              ) : null}
              {subtitle ? <p className="mt-2 max-w-2xl text-ink-600">{subtitle}</p> : null}
            </div>
            {action}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
