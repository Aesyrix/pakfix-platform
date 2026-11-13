'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Clock, MapPin, Radio, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import {
  MoneyBreakdown,
  ProSummary,
  RequestStateBadge,
  formatTimeLeft,
  offerRows,
} from '@/components/jobs/JobParts';
import { ConfirmDialog, errorText } from '@/components/jobs/JobDialogs';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { customerApi, type JobRequest, type Offer } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';

const isLive = (r: JobRequest) => r.state === 'accepting_bids' || r.state === 'choosing';

/** A customer's request and the offers on it: the app's request screen. */
export default function CustomerRequestPage() {
  return (
    <Suspense fallback={<Container className="py-6"><SkeletonCard /></Container>}>
      <CustomerRequest />
    </Suspense>
  );
}

function CustomerRequest() {
  const id = useSearchParams().get('id') ?? '';
  const t = useAppText();
  const query = useQuery({
    queryKey: ['customer-request', id],
    queryFn: () => customerApi.request(id),
    enabled: id !== '',
    // Like the app: every 6 s while offers can arrive, every minute after.
    refetchInterval: (q) => {
      const r = q.state.data as JobRequest | undefined;
      return r && !isLive(r) ? 60_000 : 6_000;
    },
  });

  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      {id === '' || (query.isError && (query.error as { status?: number }).status === 404) ? (
        <ErrorState description={t('errorTitle')} />
      ) : query.isPending ? (
        <SkeletonCard />
      ) : query.isError ? (
        <ErrorState description={t('errorGeneric')} onRetry={() => query.refetch()} />
      ) : (
        <RequestBody request={query.data} />
      )}
    </Container>
  );
}

function RequestBody({ request: r }: { request: JobRequest }) {
  const t = useAppText();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const live = isLive(r);
  const offers = r.quotes ?? [];
  const waiting = offers.filter((o) => o.status === 'sent');
  const shown = live ? waiting : offers.filter((o) => o.status !== 'accepted');
  const accepted = offers.find((o) => o.status === 'accepted');

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['customer-request', r.id] });
    void queryClient.invalidateQueries({ queryKey: ['customer-requests'] });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard/requests" className="text-sm font-medium text-brand-700 hover:underline">
          {t('actionBack')}
        </Link>
        <span className="text-sm text-ink-500" dir="ltr">
          {r.reference}
        </span>
      </div>

      {/* Header */}
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
              <CategoryIcon name={r.category?.icon ?? null} className="h-5 w-5" />
            </span>
            <h1 className="min-w-0 flex-1 self-center font-display text-lg font-bold">{r.category?.name}</h1>
            <RequestStateBadge state={r.state} />
          </div>
          <p className="text-sm text-ink-700">{r.description}</p>
          <div className="flex flex-wrap gap-2">
            {r.address_line ? (
              <Badge tone="neutral">
                <MapPin className="me-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {r.address_line}, {r.city?.name}
              </Badge>
            ) : null}
            <UrgencyBadge urgency={r.urgency} />
            {r.customer_offer ? <Badge tone="brand">{t('yourPrice', { price: r.customer_offer.display })}</Badge> : null}
          </div>
          {live ? <Countdown request={r} /> : null}
        </CardBody>
      </Card>

      {/* Booked, or booked and later cancelled: either way the job has its own page. */}
      {r.booking ? <BookedCard booking={r.booking} offer={accepted} /> : null}

      {live ? (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t('offersCount', { count: waiting.length })}</h2>
          {r.state === 'accepting_bids' ? <Radio className="h-4 w-4 animate-pulse text-accent-600" aria-hidden="true" /> : null}
        </div>
      ) : null}

      {live && waiting.length === 0 ? (
        <div className="rounded-2xl bg-accent-50 p-6 text-center">
          <p className="font-semibold">{t('waitingForOffers')}</p>
          <p className="mt-1 text-sm text-ink-600">{t('waitingForOffersBody')}</p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {shown.map((offer) => (
          <li key={offer.id}>
            <OfferCard offer={offer} canAct={live && offer.is_actionable} onChanged={refresh} />
          </li>
        ))}
      </ul>

      {live ? (
        <div className="border-t border-line pt-4">
          <Button variant="secondary" size="sm" onClick={() => setConfirmCancel(true)}>
            {t('cancelRequest')}
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={t('cancelRequest')}
        body={t('cancelRequestConfirm')}
        confirmLabel={t('cancelRequest')}
        danger
        onConfirm={async () => {
          try {
            await customerApi.cancelRequest(r.id);
            refresh();
          } catch (e) {
            toast.error(errorText(e));
          }
        }}
      />
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const t = useAppText();
  if (urgency === 'emergency') return <Badge tone="danger">{t('urgencyEmergency')}</Badge>;
  if (urgency === 'urgent') return <Badge tone="warn">{t('urgencyUrgent')}</Badge>;
  return null;
}

/** "Offers close in 1 h 20 min", ticking every 30 s. */
function Countdown({ request: r }: { request: JobRequest }) {
  const t = useAppText();
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => tick((n) => n + 1), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const text =
    r.state === 'accepting_bids' && r.expires_at
      ? t('biddingEndsIn', { time: formatTimeLeft(t, r.expires_at) })
      : r.accept_until
        ? t('chooseBefore', { time: formatTimeLeft(t, r.accept_until) })
        : '';
  if (!text) return null;
  return (
    <p className="flex items-center gap-1.5 text-sm text-ink-500">
      <Clock className="h-4 w-4" aria-hidden="true" />
      {text}
    </p>
  );
}

function BookedCard({ booking, offer }: { booking: NonNullable<JobRequest['booking']>; offer?: Offer }) {
  const t = useAppText();
  const cancelled = booking.status === 'cancelled' || booking.status === 'refunded';
  return (
    <div className={`rounded-2xl p-5 text-white ${cancelled ? 'bg-ink-600' : 'bg-brand-solid'}`}>
      <div className="flex items-start gap-3">
        {cancelled ? <XCircle className="h-7 w-7 shrink-0" aria-hidden="true" /> : <CalendarCheck className="h-7 w-7 shrink-0" aria-hidden="true" />}
        <div className="min-w-0">
          <p className="text-lg font-bold">{cancelled ? t('reqJobCancelledTitle') : t('bookedTitle')}</p>
          <p className="mt-1 text-sm text-white/85">
            {cancelled ? t('reqJobCancelledBody', { reference: booking.reference }) : t('bookedBody', { reference: booking.reference })}
          </p>
          {offer?.professional && !cancelled ? (
            <p className="mt-1 text-sm text-white/85">
              {offer.professional.name} · <span dir="ltr">{offer.total.display}</span>
            </p>
          ) : null}
        </div>
      </div>
      <ButtonLink href={`/dashboard/bookings/view?id=${booking.id}`} variant="secondary" size="sm" className="mt-4">
        {cancelled ? t('reqViewJob') : t('bkTrackJob')}
      </ButtonLink>
    </div>
  );
}

function OfferCard({ offer, canAct, onChanged }: { offer: Offer; canAct: boolean; onChanged: () => void }) {
  const t = useAppText();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const pro = offer.professional;

  async function decline() {
    setBusy(true);
    try {
      await customerApi.declineOffer(offer.id);
      onChanged();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        {pro ? <ProSummary pro={pro} /> : null}
        {offer.arrival_minutes ? <p className="text-sm text-ink-600">{t('bidArrival', { minutes: offer.arrival_minutes })}</p> : null}
        <MoneyBreakdown rows={offerRows(t, offer)} total={offer.total.display} />
        {offer.notes ? <p className="rounded-xl bg-surface-muted p-3 text-sm text-ink-700">{offer.notes}</p> : null}
        {canAct ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setConfirm(true)} disabled={busy}>
              {t('bidAccept')}
            </Button>
            <Button variant="ghost" onClick={decline} loading={busy}>
              {t('bidDecline')}
            </Button>
          </div>
        ) : null}
      </CardBody>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('acceptConfirmTitle')}
        body={t('acceptConfirmBody', { name: pro?.name ?? '', price: offer.total.display })}
        confirmLabel={t('bidAccept')}
        onConfirm={async () => {
          try {
            await customerApi.acceptOffer(offer.id);
            onChanged();
          } catch (e) {
            toast.error(errorText(e));
          }
        }}
      />
    </Card>
  );
}
