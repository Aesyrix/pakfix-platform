'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { MoneyBreakdown, OfferStatusBadge, formatTimeLeft, offerRows } from '@/components/jobs/JobParts';
import { ConfirmDialog, MoneyField, errorText, rupeesToMinor } from '@/components/jobs/JobDialogs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Dialog } from '@/components/ui/Dialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { proApi, type JobRequest, type Offer } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

/** One job a professional can offer on (the app's ProJobScreen). */
export default function ProJobPage() {
  return (
    <Suspense fallback={<Container className="py-6"><SkeletonCard /></Container>}>
      <ProJob />
    </Suspense>
  );
}

function ProJob() {
  const id = useSearchParams().get('id') ?? '';
  const t = useAppText();
  const query = useQuery({
    queryKey: ['pro-job', id],
    queryFn: () => proApi.job(id),
    enabled: id !== '',
    refetchInterval: 15_000,
    retry: false,
  });

  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <Link href="/pro/jobs" className="mb-4 inline-block text-sm font-medium text-brand-700 hover:underline">
        {t('actionBack')}
      </Link>
      {id === '' ? (
        <ErrorState description={t('errorTitle')} />
      ) : query.isPending ? (
        <SkeletonCard />
      ) : query.isError ? (
        <ErrorState description={errorText(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <JobBody request={query.data} />
      )}
    </Container>
  );
}

function JobBody({ request: r }: { request: JobRequest }) {
  const t = useAppText();
  const [sheet, setSheet] = useState<null | 'own' | 'accept'>(null);
  const place = [r.area?.name, r.city?.name].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
              <CategoryIcon name={r.category?.icon ?? null} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold">{r.category?.name}</h1>
              <p className="flex items-center gap-1 text-sm text-ink-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {[place, r.distance_km != null ? t('distanceAway', { km: r.distance_km.toFixed(1) }) : null].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <p className="text-ink-800">{r.description}</p>
          <div className="flex flex-wrap gap-2">
            {r.urgency === 'emergency' ? <Badge tone="danger">{t('urgencyEmergency')}</Badge> : null}
            {r.urgency === 'urgent' ? <Badge tone="warn">{t('urgencyUrgent')}</Badge> : null}
            {r.customer_offer ? <Badge tone="brand">{t('customerOffers', { price: r.customer_offer.display })}</Badge> : null}
            {r.customer_first_name ? (
              <Badge tone="neutral">
                <User className="me-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {r.customer_first_name}
              </Badge>
            ) : null}
            {r.expires_at ? (
              <Badge tone="neutral">
                <Clock className="me-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {t('biddingEndsIn', { time: formatTimeLeft(t, r.expires_at) })}
              </Badge>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {r.my_quote ? (
        <MyOfferCard offer={r.my_quote} requestId={r.id} />
      ) : r.accepting_bids ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {r.customer_offer ? (
            <>
              <Button size="lg" className="flex-1" onClick={() => setSheet('accept')}>
                {t('offerAccept', { price: r.customer_offer.display })}
              </Button>
              <Button size="lg" variant="secondary" className="flex-1" onClick={() => setSheet('own')}>
                {t('offerOwnPrice')}
              </Button>
            </>
          ) : (
            <Button size="lg" block onClick={() => setSheet('own')}>
              {t('sendOffer')}
            </Button>
          )}
        </div>
      ) : null}

      <OfferDialog open={sheet !== null} acceptOffer={sheet === 'accept'} request={r} onClose={() => setSheet(null)} />
    </div>
  );
}

const ARRIVALS = [15, 30, 45, 60, 120, 240];

/** Send an offer, or take the customer's price (the app's _OfferSheet). */
function OfferDialog({ open, acceptOffer, request: r, onClose }: { open: boolean; acceptOffer: boolean; request: JobRequest; onClose: () => void }) {
  const t = useAppText();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [visit, setVisit] = useState('');
  const [labour, setLabour] = useState('');
  const [materials, setMaterials] = useState('');
  const [arrival, setArrival] = useState(60);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const total = acceptOffer
    ? (r.customer_offer?.minor ?? 0)
    : (rupeesToMinor(visit) ?? 0) + (rupeesToMinor(labour) ?? 0) + (rupeesToMinor(materials) ?? 0);
  const totalDisplay = `Rs ${Math.round(total / 100).toLocaleString('en-PK')}`;

  async function send() {
    if (total <= 0) {
      setError(t('offerNeedsPrice'));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await proApi.sendOffer(
        r.id,
        acceptOffer
          ? { accept_offer: true, arrival_minutes: arrival, notes: notes.trim() || null }
          : {
              visit_fee_minor: rupeesToMinor(visit) ?? 0,
              labour_minor: rupeesToMinor(labour) ?? 0,
              materials_minor: rupeesToMinor(materials) ?? 0,
              arrival_minutes: arrival,
              notes: notes.trim() || null,
            }
      );
      toast.success(t('offerSent'));
      void queryClient.invalidateQueries({ queryKey: ['pro-job', r.id] });
      void queryClient.invalidateQueries({ queryKey: ['pro-nearby'] });
      void queryClient.invalidateQueries({ queryKey: ['pro-offers'] });
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      title={acceptOffer && r.customer_offer ? t('offerAccept', { price: r.customer_offer.display }) : t('sendOffer')}
      closeLabel={t('actionBack')}
      footer={
        <Button onClick={send} loading={busy} block>
          {t('sendOffer')} · {t('offerTotal', { price: totalDisplay })}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {!acceptOffer ? (
          <>
            <MoneyField label={t('fieldVisitFee')} value={visit} onChange={setVisit} />
            <MoneyField label={t('fieldLabour')} value={labour} onChange={setLabour} />
            <MoneyField label={t('fieldMaterials')} value={materials} onChange={setMaterials} />
          </>
        ) : null}
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t('arrivalQuestion')}</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {ARRIVALS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={arrival === m}
                onClick={() => setArrival(m)}
                className={cn(
                  'rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium',
                  arrival === m ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line text-ink-700'
                )}
              >
                {t('timeMinutes', { m })}
              </button>
            ))}
          </div>
        </fieldset>
        <Textarea label={t('fieldNotes')} rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
        {error ? <p role="alert" className="text-sm text-danger-600">{error}</p> : null}
      </div>
    </Dialog>
  );
}

function MyOfferCard({ offer, requestId }: { offer: Offer; requestId: string }) {
  const t = useAppText();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">{t('yourBid', { price: offer.total.display })}</h2>
          <OfferStatusBadge offer={offer} />
        </div>
        <MoneyBreakdown rows={offerRows(t, offer)} total={offer.total.display} />
        {offer.status === 'sent' ? (
          <div>
            <Button variant="secondary" size="sm" onClick={() => setConfirm(true)}>
              {t('withdrawOffer')}
            </Button>
          </div>
        ) : null}
      </CardBody>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('withdrawOffer')}
        confirmLabel={t('withdrawOffer')}
        danger
        onConfirm={async () => {
          try {
            await proApi.withdrawOffer(offer.id);
            void queryClient.invalidateQueries({ queryKey: ['pro-job', requestId] });
            void queryClient.invalidateQueries({ queryKey: ['pro-offers'] });
          } catch (e) {
            toast.error(errorText(e));
          }
        }}
      />
    </Card>
  );
}
