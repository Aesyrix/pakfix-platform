'use client';

import { Star } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Checkbox, Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import {
  REPORT_REASONS,
  customerApi,
  proApi,
  safetyApi,
  type Booking,
  type ReportReason,
} from '@/lib/api/marketplace';
import { useAppText, type AppStringKey } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Helpers shared by the job pages
// ---------------------------------------------------------------------------

/** Rupees typed by a person → minor units; null when empty (rupeesToMinor). */
export function rupeesToMinor(text: string): number | null {
  const digits = text.replace(/[^0-9]/g, '');
  if (!digits) return null;
  return Number(digits) * 100;
}

/** The first message for a field, else the general message. */
export function errorText(error: unknown, field?: string): string {
  if (error instanceof ApiError) {
    if (field && error.errors[field]?.[0]) return error.errors[field][0];
    const first = Object.values(error.errors)[0]?.[0];
    return first ?? error.message;
  }
  return 'Something went wrong. Please try again.';
}

/** Where this device is, if the person allows it; gives up quietly after 8 s (currentPositionOrNull). */
export function currentPositionOrNull(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  });
}

/** A Rs amount field that only takes digits. */
export function MoneyField({
  label,
  value,
  onChange,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}) {
  return (
    <Input
      label={label}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 7))}
      leading={<span className="text-sm font-semibold text-ink-500">Rs</span>}
      error={error}
      hint={hint}
      dir="ltr"
    />
  );
}

/** "Are you sure?" with a confirm and a back button. */
export function ConfirmDialog({
  open,
  onClose,
  title,
  body,
  confirmLabel,
  onConfirm,
  danger,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body?: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<unknown>;
  danger?: boolean;
}) {
  const t = useAppText();
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      title={title}
      description={body}
      closeLabel={t('actionBack')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {t('actionBack')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Report a problem (dispute)
// ---------------------------------------------------------------------------

export type DisputeKind = 'problem' | 'no_show' | 'not_paid' | 'not_done';

export function DisputeDialog({
  open,
  onClose,
  booking,
  pro,
  kinds,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  pro: boolean;
  kinds: DisputeKind[];
  onDone: (updated: Booking) => void;
}) {
  const t = useAppText();
  const toast = useToast();
  const [kind, setKind] = useState<DisputeKind>(kinds[0]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const label: Record<DisputeKind, AppStringKey> = {
    not_paid: 'bkDisputeKindNotPaid',
    not_done: 'bkDisputeKindNotDone',
    no_show: 'bkReportNoShow',
    problem: 'bkDisputeKindProblem',
  };

  async function send() {
    const description = text.trim();
    if (description.length < 10) {
      setError(t('bkDisputeTooShort'));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const updated = pro
        ? await proApi.dispute(booking.id, kind as 'not_paid' | 'not_done' | 'problem', description)
        : await customerApi.dispute(booking.id, kind as 'problem' | 'no_show', description);
      toast.success(t('bkDisputeSent'));
      onDone(updated);
      onClose();
      setText('');
    } catch (e) {
      setError(errorText(e, 'description'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      title={kind === 'no_show' ? t('bkDisputeNoShowTitle') : t('bkDisputeTitle')}
      description={t('bkDisputeHint')}
      closeLabel={t('actionBack')}
      footer={
        <Button onClick={send} loading={busy}>
          {t('bkDisputeSend')}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {kinds.length > 1 ? (
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={cn(
                  'rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium',
                  kind === k ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line text-ink-700'
                )}
              >
                {t(label[k])}
              </button>
            ))}
          </div>
        ) : null}
        <Textarea
          label={t('bkDisputeField')}
          rows={5}
          maxLength={2000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={error}
        />
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

/** The customer rates the job (RateJobCard). */
export function RateJob({ booking, onDone }: { booking: Booking; onDone: (b: Booking) => void }) {
  const t = useAppText();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const starLabels: AppStringKey[] = ['rvStar1', 'rvStar2', 'rvStar3', 'rvStar4', 'rvStar5'];

  async function submit() {
    if (rating < 1) {
      setError(t('rvStarsNeeded'));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const updated = await customerApi.review(booking.id, rating, comment.trim() || null, recommend);
      toast.success(t('rvThanks'));
      onDone(updated);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="font-semibold">{t('rvTitle', { name: booking.professional?.name ?? '' })}</h3>
      <p className="mt-1 text-sm text-ink-600">{t('rvSubtitle')}</p>
      <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label={t('rvTitle', { name: booking.professional?.name ?? '' })}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={t(starLabels[n - 1])}
            onClick={() => setRating(n)}
            className="rounded-lg p-1 hover:bg-surface-muted"
          >
            <Star className={cn('h-8 w-8', n <= rating ? 'fill-warn-500 text-warn-500' : 'text-ink-300')} aria-hidden="true" />
          </button>
        ))}
        {rating > 0 ? <span className="ms-2 text-sm font-medium text-ink-700">{t(starLabels[rating - 1])}</span> : null}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <Textarea rows={3} maxLength={2000} placeholder={t('rvCommentHint')} value={comment} onChange={(e) => setComment(e.target.value)} />
        <Checkbox label={t('rvRecommend')} checked={recommend} onChange={(e) => setRecommend(e.target.checked)} />
        {error ? <p role="alert" className="text-sm text-danger-600">{error}</p> : null}
        <div>
          <Button onClick={submit} loading={busy}>
            {t('rvSubmit')}
          </Button>
        </div>
      </div>
    </section>
  );
}

/** The review, and the professional's public reply (ReviewSummary). */
export function ReviewSummary({ booking, pro, onDone }: { booking: Booking; pro: boolean; onDone: (b: Booking) => void }) {
  const t = useAppText();
  const toast = useToast();
  const review = booking.review;
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  if (!review) return null;

  async function post() {
    const text = reply.trim();
    if (text.length < 2) return;
    setBusy(true);
    setError(undefined);
    try {
      onDone(await proApi.respondToReview(booking.id, text));
      toast.success(t('rvReplyPost'));
    } catch (e) {
      setError(errorText(e, 'response'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="font-semibold">{pro ? t('rvCustomerReview') : t('rvYourReview')}</h3>
      <div className="mt-2 flex items-center gap-0.5" aria-label={`${review.rating}/5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={cn('h-5 w-5', n <= review.rating ? 'fill-warn-500 text-warn-500' : 'text-ink-300')} aria-hidden="true" />
        ))}
      </div>
      {review.comment ? <p className="mt-2 text-sm text-ink-700">{review.comment}</p> : null}
      {pro && review.would_recommend ? <p className="mt-2 text-sm font-medium text-brand-700">{t('rvRecommended')}</p> : null}
      {review.response ? (
        <div className="mt-3 rounded-xl bg-surface-muted p-3">
          <p className="text-xs font-semibold text-ink-500">{pro ? t('rvYourReply') : t('rvProReply')}</p>
          <p className="mt-1 text-sm">{review.response}</p>
        </div>
      ) : pro ? (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea
            label={t('rvReply')}
            hint={t('rvReplyHint')}
            rows={3}
            maxLength={1000}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            error={error}
          />
          <div>
            <Button size="sm" onClick={post} loading={busy} disabled={reply.trim().length < 2}>
              {t('rvReplyPost')}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Report and block
// ---------------------------------------------------------------------------

export function ReportDialog({
  open,
  onClose,
  bookingId,
  name,
  messageId,
  onBlocked,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  name: string;
  messageId?: string;
  onBlocked?: () => void;
}) {
  const t = useAppText();
  const toast = useToast();
  const [reason, setReason] = useState<ReportReason>();
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const labels: Record<ReportReason, AppStringKey> = {
    harassment: 'sfReasonHarassment',
    inappropriate: 'sfReasonInappropriate',
    spam: 'sfReasonSpam',
    fraud: 'sfReasonFraud',
    safety: 'sfReasonSafety',
    off_platform: 'sfReasonOffPlatform',
    other: 'sfReasonOther',
  };

  async function send() {
    if (!reason) return;
    setBusy(true);
    setError(undefined);
    try {
      await safetyApi.report(bookingId, reason, details.trim() || null, messageId);
      if (alsoBlock) {
        await safetyApi.block(bookingId);
        onBlocked?.();
      }
      toast.success(t('sfReported'));
      onClose();
      setReason(undefined);
      setDetails('');
      setAlsoBlock(false);
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
      title={messageId ? t('sfReportMessage') : t('sfReportTitle')}
      description={t('sfReportBody', { name })}
      closeLabel={t('actionCancel')}
      footer={
        <Button variant="danger" onClick={send} loading={busy} disabled={!reason}>
          {t('sfSend')}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <fieldset className="flex flex-col gap-1.5">
          {REPORT_REASONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-muted">
              <input type="radio" name="report-reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-brand-600" />
              <span className="text-sm">{t(labels[r])}</span>
            </label>
          ))}
        </fieldset>
        <Textarea rows={3} maxLength={2000} placeholder={t('sfDetailsHint')} value={details} onChange={(e) => setDetails(e.target.value)} />
        <Checkbox label={t('sfAlsoBlock', { name })} checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} />
        {error ? <p role="alert" className="text-sm text-danger-600">{error}</p> : null}
      </div>
    </Dialog>
  );
}

export function BlockDialog({
  open,
  onClose,
  bookingId,
  name,
  onBlocked,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  name: string;
  onBlocked: () => void;
}) {
  const t = useAppText();
  const toast = useToast();
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={t('sfBlockTitle', { name })}
      body={t('sfBlockBody')}
      confirmLabel={t('sfBlock')}
      danger
      onConfirm={async () => {
        try {
          await safetyApi.block(bookingId);
          toast.success(t('sfBlocked'));
          onBlocked();
        } catch (e) {
          toast.error(errorText(e));
        }
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Professional: cancel, finish, revised price
// ---------------------------------------------------------------------------

export function ProCancelDialog({
  open,
  onClose,
  booking,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  onDone: (b: Booking) => void;
}) {
  const t = useAppText();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function cancel() {
    const text = reason.trim();
    if (text.length < 3) {
      setError(t('bkCancelReasonHint'));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      onDone(await proApi.cancel(booking.id, text));
      onClose();
    } catch (e) {
      setError(errorText(e, 'reason'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      title={t('bkProCancel')}
      description={t('bkProCancelWarning')}
      closeLabel={t('actionBack')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {t('actionBack')}
          </Button>
          <Button variant="danger" onClick={cancel} loading={busy}>
            {t('bkProCancel')}
          </Button>
        </>
      }
    >
      <Input label={t('bkCancelReason')} placeholder={t('bkCancelReasonHint')} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} error={error} />
    </Dialog>
  );
}

/** Finish with the customer's 4-digit code, or without it (FinishJobSheet). */
export function FinishJobDialog({
  open,
  onClose,
  booking,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  onDone: (b: Booking) => void;
}) {
  const t = useAppText();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function finish(withCode: boolean) {
    const value = code.trim();
    if (withCode && value.length !== 4) {
      setError(t('bkProCodeNeeded'));
      return;
    }
    setBusy(true);
    setError(undefined);
    const position = await currentPositionOrNull();
    try {
      const done = await proApi.advance(booking.id, 'completed', {
        code: withCode ? value : undefined,
        ...(position ?? {}),
      });
      toast.success(done.status === 'customer_confirmed' ? t('bkProFinished') : t('bkWaitingConfirm'));
      onDone(done);
      onClose();
      setCode('');
    } catch (e) {
      // A wrong code (or too many tries) is shown under the field.
      setError(errorText(e, 'code'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} title={t('bkProFinishTitle')} description={t('bkProFinishBody')} closeLabel={t('actionBack')}>
      <div className="flex flex-col gap-4">
        <Input
          label={t('bkProCodeLabel')}
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
          error={error}
          className="text-center text-2xl font-extrabold tracking-[0.5em]"
        />
        <Button block onClick={() => finish(true)} loading={busy}>
          {t('bkProFinishWithCode')}
        </Button>
        <div className="border-t border-line pt-3">
          <p className="mb-2 text-xs text-ink-500">{t('bkProWithoutCodeNote')}</p>
          <Button block variant="secondary" onClick={() => finish(false)} disabled={busy}>
            {t('bkProFinishWithoutCode')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/** After inspecting: a new labour and materials price (the visit fee stays). */
export function RevisedPriceDialog({
  open,
  onClose,
  booking,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  onDone: (b: Booking) => void;
}) {
  const t = useAppText();
  const [labour, setLabour] = useState('');
  const [materials, setMaterials] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function send() {
    const labourMinor = rupeesToMinor(labour) ?? 0;
    const materialsMinor = rupeesToMinor(materials) ?? 0;
    if (labourMinor + materialsMinor <= 0) {
      setError(t('offerNeedsPrice'));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      onDone(await proApi.revisedPrice(booking.id, labourMinor, materialsMinor, notes.trim() || null));
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
      title={t('bkRevisedSheetTitle')}
      description={t('bkRevisedSheetNote', { price: booking.visit_fee.display })}
      closeLabel={t('actionBack')}
      footer={
        <Button onClick={send} loading={busy}>
          {t('bkRevisedSend')}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <MoneyField label={t('fieldLabour')} value={labour} onChange={setLabour} />
        <MoneyField label={t('fieldMaterials')} value={materials} onChange={setMaterials} />
        <Textarea rows={3} maxLength={1000} placeholder={t('bkRevisedNotesHint')} value={notes} onChange={(e) => setNotes(e.target.value)} />
        {error ? <p role="alert" className="text-sm text-danger-600">{error}</p> : null}
      </div>
    </Dialog>
  );
}
