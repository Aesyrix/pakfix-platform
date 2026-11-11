'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { useT } from '@/components/i18n/LocaleProvider';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { BookingCard, RequestCard } from '@/components/account/AccountLists';
import { AvailabilityStrip, VerificationNotice } from '@/components/account/ProStatus';
import { accountApi } from '@/lib/api/endpoints';

/** The professional's real jobs, and open requests nearby once verified. */
export default function ProJobsPage() {
  const t = useT();
  const profile = useQuery({ queryKey: ['account-pro-profile'], queryFn: accountApi.proProfile, staleTime: 15_000 });
  const verified = profile.data?.verification.status === 'verified';
  const bookings = useQuery({ queryKey: ['account-pro-bookings'], queryFn: accountApi.proBookings, staleTime: 15_000 });
  const nearby = useQuery({ queryKey: ['account-pro-nearby'], queryFn: accountApi.proNearby, staleTime: 15_000, enabled: verified });

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader title="Jobs" titleUr="کام" />
      <div className="mb-4 flex flex-col gap-3">
        <VerificationNotice status={profile.data?.verification.status} />
        <AvailabilityStrip />
      </div>
      {bookings.isPending ? (
        <SkeletonCard />
      ) : bookings.isError || !bookings.data ? (
        <ErrorState description={t('Your jobs could not be loaded.', 'آپ کے کام لوڈ نہیں ہو سکے۔')} onRetry={() => bookings.refetch()} />
      ) : bookings.data.data.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          title={t('No jobs yet', 'ابھی کوئی کام نہیں')}
          description={t('When a customer accepts your offer, the job appears here.', 'کسٹمر کے آپ کی آفر قبول کرنے پر کام یہاں نظر آئے گا۔')}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.data.data.map((booking) => (
            <li key={booking.id}>
              <BookingCard booking={booking} />
            </li>
          ))}
        </ul>
      )}

      {verified && nearby.data && nearby.data.data.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">{t('Open requests near you', 'آپ کے قریب کھلی درخواستیں')}</h2>
          <ul className="flex flex-col gap-3">
            {nearby.data.data.map((request) => (
              <li key={request.id}>
                <RequestCard request={request} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
