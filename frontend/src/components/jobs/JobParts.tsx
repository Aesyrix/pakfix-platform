'use client';

import { Banknote, Check, CircleAlert, Clock, MapPin, Navigation, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import type { Booking, Money, Offer, ProfessionalCard, RequestState } from '@/lib/api/marketplace';
import { useAppText, type AppStringKey } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

type Tone = 'brand' | 'accent' | 'warn' | 'neutral';
type T = ReturnType<typeof useAppText>;

/** A booking's status as the app names and colours it (bookingStatusLabel). */
export function bookingStatusText(t: T, status: string): [string, Tone] {
  const map: Record<string, [AppStringKey, Tone]> = {
    technician_on_way: ['bkStatusOnWay', 'accent'],
    arrived: ['bkStatusArrived', 'accent'],
    inspection_started: ['bkStatusInspecting', 'accent'],
    quote_created: ['bkStatusQuote', 'warn'],
    quote_accepted: ['bkStatusQuoteOk', 'accent'],
    repair_started: ['bkStatusWorking', 'accent'],
    completed: ['bkStatusCompleted', 'warn'],
    customer_confirmed: ['bkStatusConfirmed', 'brand'],
    disputed: ['bkStatusDisputed', 'warn'],
    cancelled: ['bkStatusCancelled', 'neutral'],
    refunded: ['bkStatusCancelled', 'neutral'],
  };
  const [key, tone] = map[status] ?? ['bkStatusBooked', 'brand'];
  return [t(key), tone];
}

export function BookingStatusBadge({ status }: { status: string }) {
  const t = useAppText();
  const [label, tone] = bookingStatusText(t, status);
  return <Badge tone={tone}>{label}</Badge>;
}

/** A request's state (RequestStateBadge). */
export function RequestStateBadge({ state }: { state: RequestState | string }) {
  const t = useAppText();
  const map: Record<string, [AppStringKey, Tone]> = {
    accepting_bids: ['requestStateAccepting', 'accent'],
    choosing: ['requestStateChoosing', 'warn'],
    booked: ['requestStateBooked', 'brand'],
    cancelled: ['requestStateCancelled', 'neutral'],
  };
  const [key, tone] = map[state] ?? ['requestStateExpired', 'neutral'];
  return <Badge tone={tone}>{t(key)}</Badge>;
}

/** An offer's state for the professional who sent it (BidStatusBadge). */
export function OfferStatusBadge({ offer }: { offer: Pick<Offer, 'status' | 'booking_status'> }) {
  const t = useAppText();
  if (offer.status === 'accepted' && (offer.booking_status === 'cancelled' || offer.booking_status === 'refunded')) {
    return <Badge tone="neutral">{t('bidStatusJobCancelled')}</Badge>;
  }
  if (offer.status === 'accepted' && offer.booking_status === 'customer_confirmed') {
    return <Badge tone="brand">{t('bidStatusJobDone')}</Badge>;
  }
  const map: Record<string, [AppStringKey, Tone]> = {
    sent: ['bidStatusSent', 'warn'],
    accepted: ['bidStatusAccepted', 'brand'],
    rejected: ['bidStatusRejected', 'neutral'],
    withdrawn: ['bidStatusWithdrawn', 'neutral'],
  };
  const [key, tone] = map[offer.status] ?? ['requestStateExpired', 'neutral'];
  return <Badge tone={tone}>{t(key)}</Badge>;
}

/** Position on the five-step bar; -1 for a cancelled job (BookingStatus.stage). */
export function bookingStage(status: string): number {
  switch (status) {
    case 'cancelled':
    case 'refunded':
      return -1;
    case 'technician_on_way':
      return 1;
    case 'arrived':
    case 'inspection_started':
    case 'quote_created':
    case 'quote_accepted':
      return 2;
    case 'repair_started':
      return 3;
    case 'completed':
    case 'customer_confirmed':
    case 'disputed':
      return 4;
    default:
      return 0;
  }
}

/** Booked → on the way → arrived → working → done. */
export function BookingProgress({ status }: { status: string }) {
  const t = useAppText();
  const stage = bookingStage(status);
  if (stage < 0) return null;
  const steps: AppStringKey[] = ['bkStageBooked', 'bkStageOnWay', 'bkStageArrived', 'bkStageWorking', 'bkStageDone'];
  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label={t(steps[stage])}>
      {steps.map((key, index) => (
        <li key={key} className="flex flex-col gap-1.5">
          <span
            className={cn('h-1.5 rounded-full', index <= stage ? 'bg-brand-solid' : 'bg-surface-muted ring-1 ring-line')}
            aria-hidden="true"
          />
          <span className={cn('text-[11px] leading-tight', index <= stage ? 'font-semibold text-ink-900' : 'text-ink-500')}>
            {t(key)}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Rows with an amount, then the total (MoneyBreakdown: zero rows are left out). */
export function MoneyBreakdown({ rows, total }: { rows: Array<[string, Money]>; total: string }) {
  const t = useAppText();
  return (
    <dl className="flex flex-col gap-1.5 text-sm">
      {rows
        .filter(([, money]) => money.minor > 0)
        .map(([label, money]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="text-ink-600">{label}</dt>
            <dd className="font-semibold tabular-nums" dir="ltr">
              {money.display}
            </dd>
          </div>
        ))}
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-2">
        <dt className="font-semibold">{t('bidTotal')}</dt>
        <dd className="text-base font-extrabold tabular-nums" dir="ltr">
          {total}
        </dd>
      </div>
    </dl>
  );
}

export function offerRows(t: T, x: { visit_fee: Money; labour: Money; materials: Money }): Array<[string, Money]> {
  return [
    [t('bidVisit'), x.visit_fee],
    [t('bidLabour'), x.labour],
    [t('bidMaterials'), x.materials],
  ];
}

/** "8 Nov, 3:40 PM" in the visitor's time zone (formatDeadline). */
export function formatWhen(iso: string | null | undefined, locale: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ur' ? 'ur-PK' : 'en-PK', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/** "1 h 20 min" or "35 min" until a moment (formatTimeLeft). */
export function formatTimeLeft(t: T, iso: string | null | undefined): string {
  const ms = iso ? new Date(iso).getTime() - Date.now() : 0;
  if (!Number.isFinite(ms) || ms <= 0) return t('timeMinutes', { m: 0 });
  const minutes = Math.floor(ms / 60000);
  const h = Math.floor(minutes / 60);
  return h > 0 ? t('timeHoursMinutes', { h, m: minutes % 60 }) : t('timeMinutes', { m: Math.min(minutes, 59) });
}

/** The deadline sentence under a booking (bookingDeadlineText). */
export function deadlineText(t: T, b: Booking, locale: string): string | null {
  const d = b.deadlines;
  if (d.auto_confirm_at) return t('bkAutoConfirmOn', { date: formatWhen(d.auto_confirm_at, locale) });
  if (d.auto_complete_at) return t('bkAutoCompleteOn', { date: formatWhen(d.auto_complete_at, locale) });
  if (b.status === 'customer_confirmed' && d.dispute_until && b.actions.includes('dispute')) {
    return t('bkDisputeUntil', { date: formatWhen(d.dispute_until, locale) });
  }
  return null;
}

export function Note({ icon, children, tone = 'muted' }: { icon?: ReactNode; children: ReactNode; tone?: 'muted' | 'warn' | 'brand' }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
        tone === 'warn' && 'border-warn-200 bg-warn-50 text-warn-800',
        tone === 'brand' && 'border-brand-200 bg-brand-50 text-brand-800',
        tone === 'muted' && 'border-line bg-surface-muted text-ink-700'
      )}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {icon ?? <Clock className="h-4 w-4" />}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** The customer's 4-digit code, big and easy to read out (CompletionCodeCard). */
export function CompletionCodeCard({ code }: { code: string }) {
  const t = useAppText();
  return (
    <Card className="border-brand-200 bg-brand-50">
      <CardBody className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink-900">{t('bkCodeTitle')}</h3>
          <p className="mt-1 text-sm text-ink-600">{t('bkCodeBody')}</p>
        </div>
        <p dir="ltr" className="shrink-0 font-display text-3xl font-extrabold tracking-[0.3em] text-brand-700 tabular-nums">
          {code}
        </p>
      </CardBody>
    </Card>
  );
}

/** A problem PakFix is reviewing, or what it decided (DisputeStatusCard). */
export function DisputeStatusCard({ dispute }: { dispute: NonNullable<Booking['dispute']> }) {
  const t = useAppText();
  const open = dispute.status === 'open' || dispute.status === 'under_review';
  const text = open
    ? t('bkDisputeOpen')
    : dispute.outcome === 'complete'
      ? t('bkDisputeDecidedComplete')
      : t('bkDisputeDecidedCancel');
  return (
    <Note tone={open ? 'warn' : 'brand'} icon={<CircleAlert className="h-4 w-4" />}>
      <p>{text}</p>
      {!open && dispute.resolution_note ? <p className="mt-1 text-ink-600">{dispute.resolution_note}</p> : null}
    </Note>
  );
}

/** Where the job is, with directions for the professional (AddressCard). */
export function AddressCard({ booking, showDirections }: { booking: Booking; showDirections: boolean }) {
  const t = useAppText();
  const place = [booking.address_line, booking.landmark, booking.city?.name].filter(Boolean).join(', ');
  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-ink-500">{t('bkAddress')}</p>
            <p className="text-sm font-medium">{place || '—'}</p>
          </div>
        </div>
        {showDirections && booking.latitude !== null && booking.longitude !== null ? (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${booking.latitude},${booking.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            {t('bkNavigate')}
          </a>
        ) : null}
      </CardBody>
    </Card>
  );
}

/** How the job is paid, and what it costs. */
export function PaymentCard({ booking }: { booking: Booking }) {
  const t = useAppText();
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <Banknote className="h-4 w-4 text-brand-600" aria-hidden="true" />
            {t('bkPayment')}
          </h3>
          <p className="mt-0.5 text-sm text-ink-500">{t('bkPaymentCash')}</p>
        </div>
        <MoneyBreakdown rows={offerRows(t, booking)} total={booking.total.display} />
      </CardBody>
    </Card>
  );
}

/** A professional's name, rating and badge. */
export function ProSummary({ pro, label }: { pro: ProfessionalCard; label?: string }) {
  const t = useAppText();
  const initial = (pro.name || '?').charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-3">
      {pro.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars come from the API host
        <img src={pro.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-700" aria-hidden="true">
          {initial}
        </span>
      )}
      <div className="min-w-0">
        {label ? <p className="text-xs text-ink-500">{label}</p> : null}
        <p className="font-semibold">{pro.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600">
          {pro.is_verified ? <Badge tone="brand">{t('verified')}</Badge> : null}
          {pro.rating_count > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-warn-500 text-warn-500" aria-hidden="true" />
              {t('ratingCount', { rating: pro.rating_average.toFixed(1), count: pro.rating_count })}
            </span>
          ) : null}
          {pro.completed_jobs_count > 0 ? <span>{t('jobsDone', { count: pro.completed_jobs_count })}</span> : null}
        </div>
      </div>
    </div>
  );
}

/** Who did what, and when (BookingTimeline; "scheduled" steps are hidden as in the app). */
export function Timeline({ entries }: { entries: NonNullable<Booking['timeline']> }) {
  const t = useAppText();
  const visible = entries.filter((e) => e.status !== 'scheduled');
  if (visible.length === 0) return null;
  return (
    <section>
      <h3 className="mb-3 font-semibold">{t('bkTimeline')}</h3>
      <ol className="flex flex-col gap-3 border-s border-line ps-4">
        {visible.map((e, index) => (
          <TimelineRow key={`${e.status}-${index}`} entry={e} />
        ))}
      </ol>
    </section>
  );
}

function TimelineRow({ entry }: { entry: NonNullable<Booking['timeline']>[number] }) {
  const t = useAppText();
  const { locale } = useLocale();
  const [label] = bookingStatusText(t, entry.status);
  const who = entry.actor_role === 'customer' ? t('bkByCustomer') : entry.actor_role === 'technician' ? t('bkByPro') : t('bkBySystem');
  return (
    <li className="relative">
      <span className="absolute -start-[1.3rem] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-solid" aria-hidden="true">
        <Check className="h-2 w-2 text-white" />
      </span>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-ink-500">
        {who}
        {entry.at ? <span> · {formatWhen(entry.at, locale)}</span> : null}
      </p>
      {entry.note ? <p className="mt-1 text-sm text-ink-600">{entry.note}</p> : null}
    </li>
  );
}
