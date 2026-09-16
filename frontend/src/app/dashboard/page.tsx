'use client';

import {
  ArrowRight,
  Building2,
  CalendarCheck,
  FileText,
  Plus,
  Sparkles,
  Wallet,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

/**
 * The customer's home screen.
 *
 * Phase 1 wires the shell and the quick actions. The counters and lists here
 * are placeholders *in the honest sense*: each one states plainly that the
 * feature arrives in a later phase rather than showing an invented number.
 * Nothing on this page pretends to be data it does not have.
 */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const firstName = user?.profile?.first_name ?? user?.name?.split(' ')[0] ?? 'there';

  return (
    <Container className="py-6 sm:py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Hello, {firstName}
          </h1>
          <p className="mt-1.5 text-ink-600">
            Everything about your home, in one place.
          </p>
        </div>

        {user && !user.email_verified ? (
          <Badge tone="warn">Verify your email to get booking updates</Badge>
        ) : null}
      </header>

      {/* Quick actions — the four things a customer actually opens the app for. */}
      <section aria-labelledby="quick-actions" className="mt-7">
        <h2 id="quick-actions" className="sr-only">
          Quick actions
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickAction
            href="/ai"
            icon={<Sparkles className="h-5 w-5" />}
            label="Ask PakFix AI"
            description="Describe or photograph a problem"
            emphasis
          />
          <QuickAction
            href="/find-a-technician"
            icon={<Wrench className="h-5 w-5" />}
            label="Book a professional"
            description="Find someone verified nearby"
          />
          <QuickAction
            href="/dashboard/properties"
            icon={<Building2 className="h-5 w-5" />}
            label="Add a property"
            description="Keep its repair history"
          />
          <QuickAction
            href="/dashboard/quotes"
            icon={<FileText className="h-5 w-5" />}
            label="Request quotes"
            description="Compare prices before you commit"
          />
        </div>
      </section>

      {/* Summary tiles. */}
      <section aria-labelledby="summary" className="mt-8">
        <h2 id="summary" className="text-lg font-semibold tracking-tight">
          Your summary
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile icon={<CalendarCheck className="h-5 w-5" />} label="Open bookings" />
          <SummaryTile icon={<FileText className="h-5 w-5" />} label="Pending quotes" />
          <SummaryTile icon={<Wrench className="h-5 w-5" />} label="Maintenance due" />
          <SummaryTile icon={<Wallet className="h-5 w-5" />} label="Spent this year" />
        </div>
      </section>

      {/* Activity. */}
      <section aria-labelledby="activity" className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="activity" className="text-lg font-semibold tracking-tight">
            Recent activity
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            All bookings &rarr;
          </Link>
        </div>

        <div className="mt-4">
          <EmptyState
            icon={<CalendarCheck className="h-5 w-5" />}
            title="No bookings yet"
            description="Once you book a professional, the job and its full history will appear here."
            action={
              <ButtonLink href="/ai">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Diagnose a problem
              </ButtonLink>
            }
          />
        </div>
      </section>

      {/* Properties. */}
      <section aria-labelledby="properties" className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="properties" className="text-lg font-semibold tracking-tight">
            Your properties
          </h2>
          <Button variant="ghost" size="sm" disabled title="Available in the next phase">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add property
          </Button>
        </div>

        <div className="mt-4">
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title="No properties added"
            description="Add your home to keep every repair, appliance and service date against it."
          />
        </div>
      </section>
    </Container>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
  emphasis = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  emphasis?: boolean;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card
        interactive
        className={cn('h-full', emphasis && 'border-brand-600 bg-brand-600 text-white')}
      >
        <CardBody className="flex h-full flex-col gap-2 p-4">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)]',
              emphasis ? 'bg-white/15 text-white' : 'bg-surface-muted text-ink-600'
            )}
          >
            {icon}
          </span>
          <span className="mt-1 block text-sm font-semibold">{label}</span>
          <span
            className={cn('block text-xs leading-snug', emphasis ? 'text-brand-50' : 'text-ink-500')}
          >
            {description}
          </span>
          <ArrowRight
            className={cn('mt-auto h-4 w-4', emphasis ? 'text-brand-100' : 'text-ink-400')}
            aria-hidden="true"
          />
        </CardBody>
      </Card>
    </Link>
  );
}

/**
 * A counter with no number yet. It says so, rather than rendering a zero that
 * would read as "you have none" when the truth is "this is not built yet".
 */
function SummaryTile({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-surface-muted text-ink-500">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-snug text-ink-500">{label}</p>
          <p className="mt-0.5 text-xs font-medium text-ink-400">Coming in the next phase</p>
        </div>
      </CardBody>
    </Card>
  );
}
