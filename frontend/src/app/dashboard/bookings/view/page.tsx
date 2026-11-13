'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, Flag, MessageCircle, ShieldBan, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useLocale } from '@/components/i18n/LocaleProvider';
import {
  AddressCard,
  BookingProgress,
  BookingStatusBadge,
  CompletionCodeCard,
  DisputeStatusCard,
  MoneyBreakdown,
  Note,
  PaymentCard,
  ProSummary,
  Timeline,
  bookingStatusText,
  deadlineText,
  offerRows,
} from '@/components/jobs/JobParts';
import {
  BlockDialog,
  ConfirmDialog,
  DisputeDialog,
  RateJob,
  ReportDialog,
  ReviewSummary,
  errorText,
} from '@/components/jobs/JobDialogs';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { customerApi, type Booking } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';

/** A customer's booked job: the app's booking screen, on the website. */
export default function CustomerBookingPage() {
  return (
    <Suspense fallback={<Container className="py-6"><SkeletonCard /></Container>}>
      <CustomerBooking />
    </Suspense>
  );
}

function CustomerBooking() {
  const id = useSearchParams().get('id') ?? '';
  const t = useAppText();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['customer-booking', id],
    queryFn: () => customerApi.booking(id),
    enabled: id !== '',
    // Like the app: every 8 s while the job is moving, every minute after.
    refetchInterval: (q) => ((q.state.data as Booking | undefined)?.is_active === false ? 60_000 : 8_000),
  });

  const update = (b: Booking) => {
    queryClient.setQueryData(['customer-booking', id], b);
    void queryClient.invalidateQueries({ queryKey: ['account-bookings'] });
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

function BookingBody({ booking: b, onUpdate }: { booking: Booking; onUpdate: (b: Booking) => void }) {
  const t = useAppText();
  const { locale } = useLocale();
  const toast = useToast();
  const [dialog, setDialog] = useState<null | 'cancel' | 'confirm' | 'markDone' | 'noShow' | 'problem' | 'report' | 'block' | 'acceptQuote' | 'rejectQuote'>(null);
  const can = (action: Booking['actions'][number]) => b.actions.includes(action);
  const proName = b.professional?.name ?? '';
  const [statusLabel] = bookingStatusText(t, b.status);
  const deadline = deadlineText(t, b, locale);
  const close = () => setDialog(null);

  async function run(action: () => Promise<Booking>, success?: string) {
    try {
      onUpdate(await action());
      if (success) toast.success(success);
    } catch (e) {
      toast.error(errorText(e));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status header */}
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-ink-500">
                {b.category?.name} <span dir="ltr">· {b.reference}</span>
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold">{statusLabel}</h1>
            </div>
            <BookingStatusBadge status={b.status} />
          </div>
          {b.status === 'cancelled' || b.status === 'refunded' ? (
            <p className="text-sm text-ink-600">
              {b.cancellation_reason ? t('bkCancelledBecause', { reason: b.cancellation_reason }) : statusLabel}
            </p>
          ) : (
            <BookingProgress status={b.status} />
          )}
          <p className="text-sm text-ink-700">{b.problem_description}</p>
        </CardBody>
      </Card>

      {b.dispute ? <DisputeStatusCard dispute={b.dispute} /> : null}

      {/* A revised price waiting for the customer */}
      {b.pending_quote ? (
        <Card className="border-warn-200">
          <CardBody className="flex flex-col gap-3">
            <div>
              <h2 className="font-semibold">{t('bkRevisedTitle')}</h2>
              <p className="mt-1 text-sm text-ink-600">{t('bkRevisedBody')}</p>
            </div>
            <MoneyBreakdown rows={offerRows(t, b.pending_quote)} total={b.pending_quote.total.display} />
            {b.pending_quote.notes ? <p className="text-sm text-ink-700">{b.pending_quote.notes}</p> : null}
            <div className="flex flex-wrap gap-2">
              {can('accept_quote') ? (
                <Button onClick={() => setDialog('acceptQuote')}>{t('bkRevisedApprove', { price: b.pending_quote.total.display })}</Button>
              ) : null}
              {can('reject_quote') ? (
                <Button variant="secondary" onClick={() => setDialog('rejectQuote')}>
                  {t('bkRevisedDecline', { price: b.visit_fee.display })}
                </Button>
              ) : null}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {b.completion_code ? <CompletionCodeCard code={b.completion_code} /> : null}

      {b.professional ? (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <ProSummary pro={b.professional} label={t('bkYourPro')} />
            <ButtonLink href={`/dashboard/messages/chat?id=${b.id}`} variant="secondary" className="w-full sm:w-auto">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t('chatWith', { name: proName })}
            </ButtonLink>
          </CardBody>
        </Card>
      ) : null}

      <AddressCard booking={b} showDirections={false} />
      <PaymentCard booking={b} />

      {b.status === 'completed' && b.completed_via === 'customer' ? <Note>{t('bkWaitingProConfirm')}</Note> : null}

      {can('confirm') ? (
        <Button size="lg" block onClick={() => setDialog('confirm')}>
          {t('bkConfirm', { price: b.total.display })}
        </Button>
      ) : null}
      {can('mark_done') ? (
        <Button size="lg" block onClick={() => setDialog('markDone')}>
          {t('bkMarkDone')}
        </Button>
      ) : null}
      {can('no_show') ? (
        <Button variant="secondary" block onClick={() => setDialog('noShow')}>
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          {t('bkReportNoShow')}
        </Button>
      ) : null}
      {deadline ? <Note>{deadline}</Note> : null}
      {can('dispute') ? (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setDialog('problem')}>
            <CircleAlert className="h-4 w-4" aria-hidden="true" />
            {t('bkReportProblem')}
          </Button>
        </div>
      ) : null}

      {can('review') ? <RateJob booking={b} onDone={onUpdate} /> : null}
      {b.review ? <ReviewSummary booking={b} pro={false} onDone={onUpdate} /> : null}
      {b.timeline?.length ? <Timeline entries={b.timeline} /> : null}

      {/* What the app keeps in its top-right menu */}
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        {can('cancel') ? (
          <Button variant="secondary" size="sm" onClick={() => setDialog('cancel')}>
            {t('bkCancelBooking')}
          </Button>
        ) : null}
        {b.professional ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setDialog('report')}>
              <Flag className="h-4 w-4" aria-hidden="true" />
              {t('sfReportPerson', { name: proName })}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDialog('block')} className="text-danger-600">
              <ShieldBan className="h-4 w-4" aria-hidden="true" />
              {t('sfBlockPerson', { name: proName })}
            </Button>
          </>
        ) : null}
        <Link href="/dashboard/bookings" className="ms-auto self-center text-sm font-medium text-brand-700 hover:underline">
          {t('actionBack')}
        </Link>
      </div>

      <ConfirmDialog
        open={dialog === 'cancel'}
        onClose={close}
        title={t('bkCancelBooking')}
        body={t('bkCancelBookingConfirm')}
        confirmLabel={t('bkCancelBooking')}
        danger
        onConfirm={() => run(() => customerApi.cancelBooking(b.id, null))}
      />
      <ConfirmDialog
        open={dialog === 'confirm'}
        onClose={close}
        title={t('bkConfirmTitle')}
        body={t('bkConfirmBody', { price: b.total.display })}
        confirmLabel={t('bidAccept')}
        onConfirm={() => run(() => customerApi.confirm(b.id), t('bkConfirmed'))}
      />
      <ConfirmDialog
        open={dialog === 'markDone'}
        onClose={close}
        title={t('bkMarkDoneTitle')}
        body={t('bkMarkDoneBody', { total: b.total.display })}
        confirmLabel={t('bkMarkDone')}
        onConfirm={() => run(() => customerApi.markDone(b.id), t('bkMarkDoneSent'))}
      />
      {b.pending_quote ? (
        <>
          <ConfirmDialog
            open={dialog === 'acceptQuote'}
            onClose={close}
            title={t('bkRevisedTitle')}
            body={t('bkRevisedApprove', { price: b.pending_quote.total.display })}
            confirmLabel={t('bkRevisedApprove', { price: b.pending_quote.total.display })}
            onConfirm={() => run(() => customerApi.acceptRevisedPrice(b.id))}
          />
          <ConfirmDialog
            open={dialog === 'rejectQuote'}
            onClose={close}
            title={t('bkRevisedTitle')}
            body={t('bkRevisedDecline', { price: b.visit_fee.display })}
            confirmLabel={t('bkRevisedDecline', { price: b.visit_fee.display })}
            danger
            onConfirm={() => run(() => customerApi.rejectRevisedPrice(b.id))}
          />
        </>
      ) : null}
      <DisputeDialog open={dialog === 'noShow'} onClose={close} booking={b} pro={false} kinds={['no_show']} onDone={onUpdate} />
      <DisputeDialog open={dialog === 'problem'} onClose={close} booking={b} pro={false} kinds={['problem']} onDone={onUpdate} />
      <ReportDialog open={dialog === 'report'} onClose={close} bookingId={b.id} name={proName} />
      <BlockDialog open={dialog === 'block'} onClose={close} bookingId={b.id} name={proName} onBlocked={close} />
    </div>
  );
}
