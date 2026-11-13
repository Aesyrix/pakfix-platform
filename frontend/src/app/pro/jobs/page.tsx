'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { AvailabilityStrip, VerificationNotice } from '@/components/account/ProStatus';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { OfferStatusBadge, formatTimeLeft } from '@/components/jobs/JobParts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ApiError } from '@/lib/api/client';
import { accountApi } from '@/lib/api/endpoints';
import { proApi, type JobRequest } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';

/** Jobs near the professional they can send an offer on (the app's Jobs tab). */
export default function ProJobsPage() {
  const t = useAppText();
  const profile = useQuery({ queryKey: ['account-pro-profile'], queryFn: accountApi.proProfile, staleTime: 15_000 });
  const nearby = useQuery({ queryKey: ['pro-nearby'], queryFn: proApi.nearby, refetchInterval: 30_000, retry: false });
  const status = profile.data?.verification.status;
  // A professional who is not verified gets 403: the notice above explains what to do.
  const forbidden = nearby.error instanceof ApiError && nearby.error.status === 403;

  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <h1 className="mb-4 font-display text-2xl font-bold">{t('navJobs')}</h1>
      <div className="mb-5 flex flex-col gap-3">
        <AvailabilityStrip />
        {status && status !== 'verified' ? <VerificationNotice status={status} /> : null}
      </div>

      {forbidden ? null : nearby.isPending ? (
        <SkeletonCard />
      ) : nearby.isError ? (
        <ErrorState description={nearby.error instanceof ApiError ? nearby.error.message : t('errorGeneric')} onRetry={() => nearby.refetch()} />
      ) : (
        <>
          <p className="mb-3 text-sm font-semibold text-brand-700">{t('jobsRadius', { km: nearby.data.radiusKm })}</p>
          {nearby.data.items.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-5 w-5" />}
              title={t('jobsEmptyTitle')}
              description={t('jobsEmptyBody', { km: nearby.data.radiusKm })}
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {nearby.data.items.map((r) => (
                <li key={r.id}>
                  <JobCard request={r} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Container>
  );
}

function JobCard({ request: r }: { request: JobRequest }) {
  const t = useAppText();
  const place = [r.area?.name, r.city?.name].filter(Boolean).join(', ');
  return (
    <Link href={`/pro/jobs/view?id=${r.id}`} className="block">
      <Card interactive>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
              <CategoryIcon name={r.category?.icon ?? null} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.category?.name}</p>
              <p className="flex items-center gap-1 text-sm text-ink-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {[place, r.distance_km != null ? t('distanceAway', { km: r.distance_km.toFixed(1) }) : null].filter(Boolean).join(' · ')}
              </p>
            </div>
            {r.my_quote ? <OfferStatusBadge offer={r.my_quote} /> : null}
          </div>
          <p className="line-clamp-3 text-sm text-ink-700">{r.description}</p>
          <div className="flex flex-wrap gap-2">
            {r.urgency === 'emergency' ? <Badge tone="danger">{t('urgencyEmergency')}</Badge> : null}
            {r.urgency === 'urgent' ? <Badge tone="warn">{t('urgencyUrgent')}</Badge> : null}
            {r.customer_offer ? <Badge tone="brand">{t('customerOffers', { price: r.customer_offer.display })}</Badge> : null}
            {r.expires_at ? (
              <Badge tone="neutral">
                <Clock className="me-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {t('biddingEndsIn', { time: formatTimeLeft(t, r.expires_at) })}
              </Badge>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
