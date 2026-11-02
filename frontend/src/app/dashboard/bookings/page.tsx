'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { useT } from '@/components/i18n/LocaleProvider';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { BookingCard } from '@/components/account/AccountLists';
import { accountApi } from '@/lib/api/endpoints';

/** The customer's real bookings. */
export default function BookingsPage() {
  const t = useT();
  const query = useQuery({ queryKey: ['account-bookings'], queryFn: accountApi.bookings, staleTime: 15_000 });

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader title="Bookings" titleUr="بکنگز" />
      {query.isPending ? (
        <SkeletonCard />
      ) : query.isError || !query.data ? (
        <ErrorState description={t('Your bookings could not be loaded.', 'آپ کی بکنگز لوڈ نہیں ہو سکیں۔')} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-5 w-5" />}
          title={t('No bookings yet', 'ابھی تک کوئی بکنگ نہیں')}
          description={t('When you accept an offer, the job appears here.', 'آفر قبول کرنے پر کام یہاں نظر آئے گا۔')}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.data.map((booking) => (
            <li key={booking.id}>
              <BookingCard booking={booking} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
