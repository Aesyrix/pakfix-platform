'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarCheck, FileText, Sparkles, Wrench } from 'lucide-react';
import Link from 'next/link';
import { BookingCard } from '@/components/account/AccountLists';
import { StatTile } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useT } from '@/components/i18n/LocaleProvider';
import { accountApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

/** Urdu for the quick actions. */
const QUICK_ACTION_UR: Record<string, string> = {
  'Ask PakFix AI': 'پاک فکس اے آئی سے پوچھیں',
  'Describe or photograph a problem': 'مسئلہ بیان کریں یا اس کی تصویر لیں',
  'Book a professional': 'پروفیشنل بک کریں',
  'Find someone verified nearby': 'قریب ہی کوئی تصدیق شدہ پیشہ ور تلاش کریں',
  'My bookings': 'میری بکنگز',
  'See every job and its status': 'ہر کام اور اس کی حالت دیکھیں',
  'My requests': 'میری درخواستیں',
  'See requests and offers': 'درخواستیں اور آفرز دیکھیں',
};

/** The customer's home screen: only figures that are really theirs. */
export default function DashboardPage() {
  const t = useT();
  const user = useAuthStore((state) => state.user);

  const firstName = user?.profile?.first_name ?? user?.name?.split(' ')[0] ?? 'there';
  const bookings = useQuery({ queryKey: ['account-bookings'], queryFn: accountApi.bookings, staleTime: 15_000 });
  const requests = useQuery({ queryKey: ['account-requests'], queryFn: accountApi.requests, staleTime: 15_000 });
  const openBookings = bookings.data?.data.filter((booking) => booking.is_active).length ?? 0;

  return (
    <Container className="py-6 sm:py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t(`Hello, ${firstName}`, `السلام علیکم، ${firstName}`)}
          </h1>
          <p className="mt-1.5 text-ink-600">
            {t('Everything about your home, in one place.', 'آپ کے گھر کی ہر چیز، ایک ہی جگہ۔')}
          </p>
        </div>

        {user && !user.email_verified ? (
          <Badge tone="warn">
            {t('Verify your email to get booking updates', 'بکنگ اپ ڈیٹس حاصل کرنے کے لیے اپنی ای میل کی تصدیق کریں')}
          </Badge>
        ) : null}
      </header>

      {/* Quick actions — the four things a customer actually opens the app for. */}
      <section aria-labelledby="quick-actions" className="mt-7">
        <h2 id="quick-actions" className="sr-only">
          {t('Quick actions', 'فوری اقدامات')}
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickAction
            href="/ai"
            icon={<Sparkles className="h-5 w-5" />}
            label="Ask PakFix AI"
            description="Describe a problem, get guidance"
            emphasis
          />
          <QuickAction
            href="/dashboard/requests/new"
            icon={<Wrench className="h-5 w-5" />}
            label="Post a request"
            description="Verified pros nearby send you offers"
          />
          <QuickAction
            href="/dashboard/bookings"
            icon={<CalendarCheck className="h-5 w-5" />}
            label="My bookings"
            description="See every job and its status"
          />
          <QuickAction
            href="/dashboard/requests"
            icon={<FileText className="h-5 w-5" />}
            label="My requests"
            description="See requests and offers"
          />
        </div>
      </section>

      {/* Summary tiles. */}
      <section aria-labelledby="summary" className="mt-8">
        <h2 id="summary" className="text-lg font-semibold tracking-tight">
          {t('Your summary', 'آپ کا خلاصہ')}
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <StatTile
            icon={<CalendarCheck className="h-4 w-4" />}
            label="Open bookings"
            labelUr="کھلی بکنگز"
            value={bookings.data ? String(openBookings) : '—'}
          />
          <StatTile
            icon={<FileText className="h-4 w-4" />}
            label="Your requests"
            labelUr="آپ کی درخواستیں"
            value={requests.data ? String(requests.data.data.length) : '—'}
          />
        </div>
      </section>

      {/* Activity. */}
      <section aria-labelledby="activity" className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="activity" className="text-lg font-semibold tracking-tight">
            {t('Recent bookings', 'حالیہ بکنگز')}
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {t('All bookings', 'تمام بکنگ')} &rarr;
          </Link>
        </div>

        <div className="mt-4">
          {bookings.isPending ? (
            <SkeletonCard />
          ) : bookings.isError || !bookings.data ? (
            <ErrorState description={t('Your bookings could not be loaded.', 'آپ کی بکنگز لوڈ نہیں ہو سکیں۔')} onRetry={() => bookings.refetch()} />
          ) : bookings.data.data.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="h-5 w-5" />}
              title={t('No bookings yet', 'ابھی تک کوئی بکنگ نہیں')}
              description={t(
                'Once you book a professional, the job and its full history will appear here.',
                'جب آپ کوئی پروفیشنل بک کریں گے تو کام اور اس کی مکمل تاریخ یہاں نظر آئے گی۔'
              )}
              action={
                <ButtonLink href="/ai">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t('Diagnose a problem', 'مسئلے کی تشخیص کریں')}
                </ButtonLink>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {bookings.data.data.slice(0, 3).map((booking) => (
                <li key={booking.id}>
                  <BookingCard booking={booking} />
                </li>
              ))}
            </ul>
          )}
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
  const t = useT();

  return (
    <Link href={href} className="block h-full">
      <Card
        interactive
        className={cn('h-full', emphasis && 'border-brand-600 bg-brand-solid text-white')}
      >
        <CardBody className="flex h-full flex-col gap-2 p-4">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)]',
              emphasis ? 'bg-surface/15 text-white' : 'bg-surface-muted text-ink-600'
            )}
          >
            {icon}
          </span>
          <span className="mt-1 block text-sm font-semibold">{t(label, QUICK_ACTION_UR[label])}</span>
          <span
            className={cn('block text-xs leading-snug', emphasis ? 'text-brand-50' : 'text-ink-500')}
          >
            {t(description, QUICK_ACTION_UR[description])}
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
