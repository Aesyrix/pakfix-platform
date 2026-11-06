'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { Distance, formatAdminDate, initialSearch, Pager, Timeline, useDebounced } from '@/components/admin/AdminBits';
import { useT } from '@/components/i18n/LocaleProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { adminApi } from '@/lib/api/endpoints';
import type { AdminBookingRow } from '@/lib/api/types';

const VIA: Record<string, [string, string]> = {
  code: ["Finished with the customer's code", 'کسٹمر کے کوڈ سے مکمل'],
  customer: ['Customer said it was done', 'کسٹمر نے مکمل بتایا'],
  professional: ['Professional said it was done (no code)', 'پروفیشنل نے مکمل بتایا (کوڈ کے بغیر)'],
  auto: ['Marked done automatically', 'خودبخود مکمل'],
  admin: ['Decided by PakFix', 'پاک فکس کا فیصلہ'],
};

function tone(row: AdminBookingRow): 'safe' | 'warn' | 'neutral' | 'info' {
  if (row.status === 'disputed') return 'warn';
  if (row.status === 'customer_confirmed') return 'safe';
  if (row.is_finished) return 'neutral';
  return 'info';
}

/** Every booked job on PakFix: search, see the full record, cancel when needed. */
export default function AdminBookingsPage() {
  const t = useT();
  // Opened from a user's record with ?search=PF-2026-000123: show that job in
  // any state. Admin pages render only in the browser (after RequireAuth).
  const [search, setSearch] = useState(() => initialSearch());
  const [status, setStatus] = useState(() => (initialSearch() ? 'all' : 'active'));
  const [page, setPage] = useState(1);
  const term = useDebounced(search.trim());

  const query = useQuery({
    queryKey: ['admin-bookings', status, term, page],
    queryFn: () => adminApi.bookings({ status, search: term || undefined, page }),
    staleTime: 15_000,
  });

  return (
    <>
      <AdminPageHeader
        title={t('Bookings', 'بکنگز')}
        description={t(
          'Every booked job. Open one to see both sides, the money, where the professional was, and every step. Cancel a job only when PakFix has to (for example, a suspended account); nobody is charged and both sides are told. Disputed jobs are decided on the Disputes page.',
          'ہر بک شدہ کام۔ کھول کر دونوں فریق، رقم، پروفیشنل کی جگہ اور ہر مرحلہ دیکھیں۔ کام صرف تب منسوخ کریں جب پاک فکس کو کرنا ہو (مثلاً معطل اکاؤنٹ)؛ کسی سے کچھ نہیں لیا جاتا اور دونوں کو بتایا جاتا ہے۔ تنازع والے کام تنازعات صفحے پر طے ہوتے ہیں۔'
        )}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Input
          label={t('Search', 'تلاش')}
          placeholder={t('Job reference or a name', 'کام کا حوالہ یا نام')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select label={t('Show', 'دکھائیں')} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="active">{t('In progress', 'جاری')}</option>
          <option value="disputed">{t('Disputed', 'تنازع')}</option>
          <option value="finished">{t('Finished or cancelled', 'مکمل یا منسوخ')}</option>
          <option value="all">{t('All', 'سب')}</option>
        </Select>
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description={t('The bookings could not be loaded.', 'بکنگز لوڈ نہیں ہو سکیں۔')} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState title={t('No jobs here', 'یہاں کوئی کام نہیں')} description={t('Try another search or filter.', 'کوئی اور تلاش یا فلٹر آزمائیں۔')} />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {query.data.data.map((row) => (
              <li key={row.id}>
                <BookingCard row={row} startOpen={query.data.data.length === 1 && term !== ''} />
              </li>
            ))}
          </ul>
          <Pager pagination={query.data.pagination} page={page} onPage={setPage} />
        </>
      )}
    </>
  );
}

function BookingCard({ row, startOpen }: { row: AdminBookingRow; startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen);

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <button type="button" className="flex w-full flex-wrap items-start justify-between gap-3 text-start" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <div>
            <h2 className="font-semibold">
              {row.reference} · {row.category}
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {row.customer?.name ?? '-'} → {row.professional?.name ?? '-'} · {row.total} · {formatAdminDate(row.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={tone(row)}>{row.status_label}</Badge>
            <ChevronDown className={open ? 'h-4 w-4 rotate-180 transition-transform' : 'h-4 w-4 transition-transform'} aria-hidden="true" />
          </div>
        </button>
        {open ? <BookingDetail id={row.id} /> : null}
      </CardBody>
    </Card>
  );
}

function BookingDetail({ id }: { id: string }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const overview = queryClient.getQueryData<{ permissions?: Record<string, boolean> }>(['admin-overview']);
  const detail = useQuery({ queryKey: ['admin-booking', id], queryFn: () => adminApi.booking(id) });

  const cancel = useMutation({
    mutationFn: () => adminApi.cancelBooking(id, reason.trim()),
    onSuccess: (r) => {
      toast.success(r.message);
      setReason('');
      void queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-booking', id] });
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: (error) => {
      const first = error instanceof ApiError ? Object.values(error.errors)[0]?.[0] ?? error.message : undefined;
      toast.error(first ?? t('Could not cancel the job.', 'کام منسوخ نہیں ہو سکا۔'));
    },
  });

  if (detail.isPending) return <SkeletonCard />;
  if (detail.isError || !detail.data) {
    return <ErrorState description={t('Could not load this job.', 'یہ کام لوڈ نہیں ہو سکا۔')} onRetry={() => detail.refetch()} />;
  }
  const b = detail.data;

  return (
    <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-3 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t('Customer', 'کسٹمر')}</p>
          {b.customer ? (
            <Link href={`/admin/users?search=${encodeURIComponent(b.customer.name)}`} className="font-semibold hover:underline">
              {b.customer.name}
            </Link>
          ) : (
            '-'
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t('Professional', 'پروفیشنل')}</p>
          {b.professional ? (
            <Link href={`/admin/users?search=${encodeURIComponent(b.professional.name)}`} className="font-semibold hover:underline">
              {b.professional.name}
            </Link>
          ) : (
            '-'
          )}
        </div>
      </div>

      <div>
        <p>{b.problem_description}</p>
        <p className="mt-1 text-ink-600">
          {b.address_line}
          {b.city ? `, ${b.city}` : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
        <span>
          {t('Visit', 'وزٹ')} {b.visit_fee} · {t('Labour', 'مزدوری')} {b.labour} · {t('Materials', 'سامان')} {b.materials} ·{' '}
          <span className="font-semibold text-foreground">
            {t('Total', 'کل')} {b.total}
          </span>
        </span>
        {b.payment_status ? <span>{t('Payment', 'ادائیگی')}: {b.payment_status}</span> : null}
        {b.completed_via && VIA[b.completed_via] ? <span>{t(...VIA[b.completed_via])}</span> : null}
        <Distance label={t('Arrived', 'پہنچے')} metres={b.arrived_distance_m} far={b.arrived_far} />
        <Distance label={t('Finished', 'مکمل')} metres={b.completed_distance_m} far={b.completed_far} />
      </div>

      {b.deadlines.auto_complete_at || b.deadlines.auto_confirm_at ? (
        <p className="text-xs text-ink-600">
          {b.deadlines.auto_confirm_at
            ? t(`Confirms automatically on ${formatAdminDate(b.deadlines.auto_confirm_at)}`, `${formatAdminDate(b.deadlines.auto_confirm_at)} کو خودبخود تصدیق`)
            : t(`Marked done automatically on ${formatAdminDate(b.deadlines.auto_complete_at)}`, `${formatAdminDate(b.deadlines.auto_complete_at)} کو خودبخود مکمل`)}
        </p>
      ) : null}

      {b.dispute ? (
        <p className="rounded-[var(--radius-control)] bg-[#FEF3C7] px-3 py-2 text-[#92400E]">
          {t('Dispute', 'تنازع')} {b.dispute.reference} ({b.dispute.kind.replaceAll('_', ' ')}) · {b.dispute.status}
          {b.dispute.outcome ? ` · ${b.dispute.outcome}` : ''} ·{' '}
          <Link href="/admin/disputes" className="font-semibold underline">
            {t('Open Disputes', 'تنازعات کھولیں')}
          </Link>
        </p>
      ) : null}

      {b.cancellation_reason ? (
        <p className="text-ink-600">
          <span className="font-semibold">{t('Cancelled because', 'منسوخی کی وجہ')}: </span>
          {b.cancellation_reason}
        </p>
      ) : null}

      {b.review ? (
        <p className="text-ink-600">
          <span className="font-semibold">{t('Review', 'ریویو')}: </span>
          {'★'.repeat(b.review.rating)}
          {b.review.comment ? ` · ${b.review.comment}` : ''}
        </p>
      ) : null}

      <div className="border-t border-[var(--border)] pt-2">
        <Timeline steps={b.timeline} />
      </div>

      {b.can_cancel && overview?.permissions?.cancel_bookings ? (
        <div className="flex flex-col gap-2">
          <Textarea
            label={t('Reason for cancelling (both sides are told)', 'منسوخی کی وجہ (دونوں فریقوں کو بتایا جائے گا)')}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
          />
          <Button
            size="sm"
            variant="danger"
            className="self-start"
            disabled={cancel.isPending || reason.trim().length < 5}
            onClick={() => {
              if (window.confirm(t(`Cancel ${b.reference}? Nobody will be charged.`, `${b.reference} منسوخ کریں؟ کسی سے کچھ نہیں لیا جائے گا۔`))) cancel.mutate();
            }}
          >
            {t('Cancel this job', 'یہ کام منسوخ کریں')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
