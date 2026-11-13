'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { BookingStatusBadge } from '@/components/jobs/JobParts';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { proApi } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';

/** The professional's booked jobs, active first (the app's My jobs tab). */
export default function ProBookingsPage() {
  const t = useAppText();
  const bookings = useQuery({ queryKey: ['pro-bookings'], queryFn: proApi.bookings, refetchInterval: 30_000 });

  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <h1 className="mb-5 font-display text-2xl font-bold">{t('navMyJobs')}</h1>
      {bookings.isPending ? (
        <SkeletonCard />
      ) : bookings.isError ? (
        <ErrorState description={t('errorGeneric')} onRetry={() => bookings.refetch()} />
      ) : bookings.data.length === 0 ? (
        <EmptyState icon={<CalendarCheck className="h-5 w-5" />} title={t('bkProEmpty')} description={t('bkProEmptyBody')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.data.map((b) => (
            <li key={b.id}>
              <Link href={`/pro/bookings/view?id=${b.id}`} className="block">
                <Card interactive>
                  <CardBody className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                      <CategoryIcon name={b.category?.icon ?? null} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{b.category?.name}</p>
                      <p className="truncate text-sm text-ink-500">
                        {[b.customer_first_name, b.city?.name].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </CardBody>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
