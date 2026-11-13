'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Plus } from 'lucide-react';
import Link from 'next/link';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { BookingStatusBadge, RequestStateBadge, formatTimeLeft } from '@/components/jobs/JobParts';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { customerApi, type JobRequest } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';

const isLive = (r: JobRequest) => r.state === 'accepting_bids' || r.state === 'choosing';

/** The customer's requests, live ones first, with active jobs above (the app's Requests tab). */
export default function RequestsPage() {
  const t = useAppText();
  const requests = useQuery({ queryKey: ['customer-requests'], queryFn: customerApi.requests, refetchInterval: 20_000 });
  const bookings = useQuery({ queryKey: ['account-bookings-full'], queryFn: customerApi.bookings, refetchInterval: 20_000 });
  const active = (bookings.data ?? []).filter((b) => b.is_active);
  const sorted = [...(requests.data ?? [])].sort((a, b) => Number(isLive(b)) - Number(isLive(a)));

  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{t('navRequests')}</h1>
        <ButtonLink href="/dashboard/requests/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('postTitle')}
        </ButtonLink>
      </div>

      {active.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-3 font-semibold">{t('bkActiveJobs')}</h2>
          <ul className="flex flex-col gap-3">
            {active.map((b) => (
              <li key={b.id}>
                <Link href={`/dashboard/bookings/view?id=${b.id}`} className="block">
                  <Card interactive>
                    <CardBody className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                        <CategoryIcon name={b.category?.icon ?? null} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{b.category?.name}</p>
                        <p className="truncate text-sm text-ink-500">{b.professional?.name}</p>
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </CardBody>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {requests.isPending ? (
        <SkeletonCard />
      ) : requests.isError ? (
        <ErrorState description={t('errorGeneric')} onRetry={() => requests.refetch()} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title={t('requestsEmptyTitle')}
          description={t('requestsEmptyBody')}
          action={<ButtonLink href="/dashboard/requests/new">{t('postTitle')}</ButtonLink>}
        />
      ) : (
        <section>
          {active.length > 0 ? <h2 className="mb-3 font-semibold">{t('navRequests')}</h2> : null}
          <ul className="flex flex-col gap-3">
            {sorted.map((r) => (
              <li key={r.id}>
                <Link href={`/dashboard/requests/view?id=${r.id}`} className="block">
                  <Card interactive>
                    <CardBody className="flex flex-col gap-2">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                          <CategoryIcon name={r.category?.icon ?? null} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{r.category?.name}</p>
                          <p className="text-xs text-ink-500" dir="ltr">
                            {r.reference}
                          </p>
                        </div>
                        <RequestStateBadge state={r.state} />
                      </div>
                      <p className="line-clamp-2 text-sm text-ink-700">{r.description}</p>
                      <p className="text-sm text-ink-500">
                        {t('offersCount', { count: r.quotes_count })}
                        {r.state === 'accepting_bids' && r.expires_at ? ` · ${t('biddingEndsIn', { time: formatTimeLeft(t, r.expires_at) })}` : ''}
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
