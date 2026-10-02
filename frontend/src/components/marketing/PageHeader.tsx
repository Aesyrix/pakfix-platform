import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils/cn';

export interface Crumb {
  name: string;
  href?: string;
}

/** Visible breadcrumbs. Pair with breadcrumbSchema() for the structured-data version. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
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
    <section className="border-b border-[var(--border)] bg-gradient-to-b from-brand-wash to-background">
      <Container size={size} className="py-10 sm:py-14">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-5" /> : null}
        {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
        <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h1>
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
      className={cn('py-12 sm:py-16', muted && 'border-y border-[var(--border)] bg-surface')}
    >
      <Container>
        {title || action ? (
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              {title ? (
                <h2 id={headingId} className="text-2xl font-bold tracking-tight sm:text-3xl">
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
