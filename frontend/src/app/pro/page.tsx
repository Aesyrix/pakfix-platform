'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AvailabilityStrip, VerificationNotice } from '@/components/account/ProStatus';
import { PageHeader, StatTile } from '@/components/dashboard/DashboardPage';
import { useT } from '@/components/i18n/LocaleProvider';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ButtonLink } from '@/components/ui/Button';
import { accountApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/auth';

const STATUS: Record<string, [string, string, 'safe' | 'warn' | 'danger' | 'neutral']> = {
  verified: ['Verified', 'تصدیق شدہ', 'safe'],
  pending: ['Awaiting review', 'جائزے کا منتظر', 'warn'],
  rejected: ['Sent back', 'واپس بھیجا گیا', 'danger'],
  more_info_requested: ['More information needed', 'مزید معلومات درکار', 'danger'],
  suspended: ['Suspended', 'معطل', 'danger'],
  not_submitted: ['Not submitted', 'جمع نہیں کرایا', 'neutral'],
};

/** The professional's home: only figures that are really theirs. */
export default function ProOverviewPage() {
  const t = useT();
  const firstName = useAuthStore((state) => state.user?.name?.split(' ')[0]);
  const profile = useQuery({ queryKey: ['account-pro-profile'], queryFn: accountApi.proProfile, staleTime: 15_000 });
  const bookings = useQuery({ queryKey: ['account-pro-bookings'], queryFn: accountApi.proBookings, staleTime: 15_000 });

  const status = profile.data?.verification.status ?? 'not_submitted';
  const [label, labelUr] = STATUS[status] ?? [status, status];
  const jobs = bookings.data?.data ?? [];

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Professional portal"
        eyebrowUr="پروفیشنل پورٹل"
        title={firstName ? `Welcome, ${firstName}` : 'Welcome'}
        titleUr={firstName ? `خوش آمدید، ${firstName}` : 'خوش آمدید'}
      />
      {profile.isPending || bookings.isPending ? (
        <SkeletonCard />
      ) : profile.isError || bookings.isError ? (
        <ErrorState
          description={t('Your account could not be loaded.', 'آپ کا اکاؤنٹ لوڈ نہیں ہو سکا۔')}
          onRetry={() => {
            void profile.refetch();
            void bookings.refetch();
          }}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3">
            <VerificationNotice status={status} />
            <AvailabilityStrip />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile icon={<ShieldCheck className="h-4 w-4" />} label="Verification" labelUr="تصدیق" value={t(label, labelUr)} />
            <StatTile icon={<Briefcase className="h-4 w-4" />} label="Active jobs" labelUr="جاری کام" value={String(jobs.filter((job) => job.is_active).length)} />
            <StatTile icon={<CheckCircle2 className="h-4 w-4" />} label="Completed jobs" labelUr="مکمل کام" value={String(jobs.filter((job) => job.status === 'customer_confirmed').length)} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/pro/jobs">{t('View jobs', 'کام دیکھیں')}</ButtonLink>
            <ButtonLink href="/pro/verification" variant="secondary">{t('Verification', 'تصدیق')}</ButtonLink>
          </div>
        </>
      )}
    </Container>
  );
}
