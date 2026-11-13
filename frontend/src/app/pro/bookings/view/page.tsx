'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, Clock, Flag, MessageCircle, ShieldBan } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useLocale } from '@/components/i18n/LocaleProvider';
import {
  AddressCard,
  BookingProgress,
  BookingStatusBadge,
  DisputeStatusCard,
  Note,
  PaymentCard,
  Timeline,
  bookingStage,
  bookingStatusText,
  deadlineText,
} from '@/components/jobs/JobParts';
import {
  BlockDialog,
  ConfirmDialog,
  DisputeDialog,
  FinishJobDialog,
  ProCancelDialog,
  ReportDialog,
  RevisedPriceDialog,
  ReviewSummary,
  currentPositionOrNull,
  errorText,
  type DisputeKind,
} from '@/components/jobs/JobDialogs';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { proApi, type Booking, type BookingAction } from '@/lib/api/marketplace';
import { useAppText, type AppStringKey } from '@/lib/i18n/app-text';

const STEPS: Array<[BookingAction, AppStringKey]> = [
  ['on_way', 'bkProOnWay'],
  ['arrived', 'bkProArrived'],
  ['inspecting', 'bkProInspecting'],
  ['working', 'bkProWorking'],
  ['completed', 'bkProCompleted'],
];

/** A professional's booked job (the app's ProBookingScreen). */
export default function ProBookingPage() {
  return (
    <Suspense fallback={<Container className="py-6"><SkeletonCard /></Container>}>
      <ProBooking />
    </Suspense>
  );
}

function ProBooking() {
  const id = useSearchParams().get('id') ?? '';
  const t = useAppText();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['pro-booking', id],
    queryFn: () => proApi.booking(id),
    enabled: id !== '',
    refetchInterval: (q) => ((q.state.data as Booking | undefined)?.is_active === false ? 60_000 : 8_000),
  });
  const update = (b: Booking) => {
    queryClient.setQueryData(['pro-booking', id], b);
    void queryClient.invalidateQueries({ queryKey: ['pro-bookings'] });
  };

  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      {id === '' || (query.isError && (query.error as { status?: number }).status === 404) ? (
        <ErrorState description={t('errorTitle')} />
      ) : query.isPending ? (
        <SkeletonCard />
      ) : query.isError ? (
        <ErrorState description={t('errorGeneric')} onRetry={() => query.refetch()} />
      ) : (
        <BookingBody booking={query.data} onUpdate={update} />
      )}
    </Container>
  );
}

type DialogName = null | 'cancel' | 'finish' | 'revised' | 'agree' | 'report' | 'block' | 'dispute';

function BookingBody({ booking: b, onUpdate }: { booking: Booking; onUpdate: (b: Booking) => void }) {
  const t = useAppText();
  const { locale } = useLocale();
  const [dialog, setDialog] = useState<DialogName>(null);
  const [disputeKinds, setDisputeKinds] = useState<DisputeKind[]>(['problem']);
  const can = (a: BookingAction) => b.actions.includes(a);
  const name = b.customer_first_name ?? t('bkCustomer');
  const [statusLabel] = bookingStatusText(t, b.status);
  const close = () => setDialog(null);
  const openDispute = (kinds: DisputeKind[]) => {
    setDisputeKinds(kinds);
    setDialog('dispute');
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-ink-500">
                {[b.category?.name, b.customer_first_name ? `${t('bkCustomer')}: ${b.customer_first_name}` : null].filter(Boolean).join(' · ')}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold">{statusLabel}</h1>
            </div>
            <BookingStatusBadge status={b.status} />
          </div>
          <p className="text-ink-800">{b.problem_description}</p>
          {bookingStage(b.status) >= 0 ? <BookingProgress status={b.status} /> : null}
          {b.cancellation_reason && (b.status === 'cancelled' || b.status === 'refunded') ? (
            <p className="text-sm text-ink-600">{t('bkCancelledBecause', { reason: b.cancellation_reason })}</p>
          ) : null}
        </CardBody>
      </Card>

      {b.dispute ? <DisputeStatusCard dispute={b.dispute} /> : null}

      <NextStep booking={b} onUpdate={onUpdate} openDialog={setDialog} openDispute={openDispute} locale={locale} />

      <ButtonLink href={`/pro/messages/chat?id=${b.id}`} variant="secondary">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {t('chatWith', { name })}
      </ButtonLink>
      <AddressCard booking={b} showDirections={b.is_active} />
      <PaymentCard booking={b} />
      {b.review ? <ReviewSummary booking={b} pro onDone={onUpdate} /> : null}
      {b.timeline?.length ? <Timeline entries={b.timeline} /> : null}

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        {can('cancel') ? (
          <Button variant="secondary" size="sm" onClick={() => setDialog('cancel')}>
            {t('bkProCancel')}
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={() => setDialog('report')}>
          <Flag className="h-4 w-4" aria-hidden="true" />
          {t('sfReportPerson', { name })}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDialog('block')} className="text-danger-600">
          <ShieldBan className="h-4 w-4" aria-hidden="true" />
          {t('sfBlockPerson', { name })}
        </Button>
        <Link href="/pro/bookings" className="ms-auto self-center text-sm font-medium text-brand-700 hover:underline">
          {t('actionBack')}
        </Link>
      </div>

      <ProCancelDialog open={dialog === 'cancel'} onClose={close} booking={b} onDone={onUpdate} />
      <FinishJobDialog open={dialog === 'finish'} onClose={close} booking={b} onDone={onUpdate} />
      <RevisedPriceDialog open={dialog === 'revised'} onClose={close} booking={b} onDone={onUpdate} />
      <DisputeDialog open={dialog === 'dispute'} onClose={close} booking={b} pro kinds={disputeKinds} onDone={onUpdate} />
      <ConfirmDialog
        open={dialog === 'agree'}
        onClose={close}
        title={t('bkProAgreeDone')}
        body={t('bkProCustomerSaysDone')}
        confirmLabel={t('bkProAgreeDone')}
        onConfirm={() => proApi.confirm(b.id).then(onUpdate)}
      />
      <ReportDialog open={dialog === 'report'} onClose={close} bookingId={b.id} name={name} />
      <BlockDialog open={dialog === 'block'} onClose={close} bookingId={b.id} name={name} onBlocked={close} />
    </div>
  );
}

/** What the professional does next (the app's _NextStep). */
function NextStep({
  booking: b,
  onUpdate,
  openDialog,
  openDispute,
  locale,
}: {
  booking: Booking;
  onUpdate: (b: Booking) => void;
  openDialog: (d: DialogName) => void;
  openDispute: (kinds: DisputeKind[]) => void;
  locale: string;
}) {
  const t = useAppText();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const can = (a: BookingAction) => b.actions.includes(a);
  const next = STEPS.find(([step]) => can(step));
  const deadline = deadlineText(t, b, locale);

  // The customer said the work is done: agree, or say it was never done.
  if (can('confirm_done')) {
    return (
      <div className="flex flex-col gap-3">
        <Note>{t('bkProCustomerSaysDone')}</Note>
        <Button size="lg" block onClick={() => openDialog('agree')}>
          {t('bkProAgreeDone')}
        </Button>
        {can('dispute') ? (
          <div>
            <Button variant="ghost" size="sm" onClick={() => openDispute(['not_done', 'problem'])}>
              <CircleAlert className="h-4 w-4" aria-hidden="true" />
              {t('bkReportProblem')}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  const waiting = b.status === 'quote_created' ? t('bkRevisedWaiting') : b.status === 'completed' ? t('bkWaitingConfirm') : null;
  if (waiting || (!next && !can('revised_quote'))) {
    return (
      <div className="flex flex-col gap-3">
        {waiting ? <Note icon={<Clock className="h-4 w-4" />}>{waiting}</Note> : null}
        {deadline ? <Note>{deadline}</Note> : null}
        {/* Also after the job is confirmed (e.g. the customer did not pay), while the server allows it. */}
        {can('dispute') ? (
          <div>
            <Button variant="ghost" size="sm" onClick={() => openDispute(['not_paid', 'problem'])}>
              <CircleAlert className="h-4 w-4" aria-hidden="true" />
              {t('bkReportProblem')}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  async function advance(step: BookingAction) {
    if (step === 'completed') {
      openDialog('finish');
      return;
    }
    setBusy(true);
    // Where the professional is, when they say they have arrived.
    const position = step === 'arrived' ? await currentPositionOrNull() : null;
    try {
      onUpdate(await proApi.advance(b.id, step, position ?? {}));
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {next ? (
        <Button size="lg" block loading={busy} onClick={() => advance(next[0])}>
          {t(next[1])}
        </Button>
      ) : null}
      {can('revised_quote') ? (
        <Button variant="secondary" block onClick={() => openDialog('revised')}>
          {t('bkProRevise')}
        </Button>
      ) : null}
      {deadline ? <Note>{deadline}</Note> : null}
    </div>
  );
}
