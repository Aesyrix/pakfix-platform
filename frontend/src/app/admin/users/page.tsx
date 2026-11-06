'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Mail, Phone, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { formatAdminDate, initialSearch, Pager, useDebounced } from '@/components/admin/AdminBits';
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
import type { AdminUser } from '@/lib/api/types';

function errorText(error: unknown, fallback: string): string {
  return (error instanceof ApiError ? Object.values(error.errors)[0]?.[0] ?? error.message : undefined) ?? fallback;
}

/** Customers and professionals: find someone, see their record, suspend or restore. */
export default function AdminUsersPage() {
  const t = useT();
  // Opened from a job with ?search=Name: start with that person. Admin pages
  // render only in the browser (after RequireAuth), so window is available.
  const [search, setSearch] = useState(() => initialSearch());
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const term = useDebounced(search.trim());

  const query = useQuery({
    queryKey: ['admin-users', term, role, status, page],
    queryFn: () => adminApi.users({ search: term || undefined, role: role || undefined, status: status || undefined, page }),
    staleTime: 15_000,
  });

  return (
    <>
      <AdminPageHeader
        title={t('Users', 'صارفین')}
        description={t(
          'Customers and professionals. Open someone to see their jobs and reports. Suspending signs them out everywhere, closes their open requests and withdraws their open offers; booked jobs stay until you cancel them on the Bookings page.',
          'کسٹمرز اور پروفیشنلز۔ کسی کو کھول کر ان کے کام اور شکایات دیکھیں۔ معطل کرنے سے وہ ہر جگہ سے سائن آؤٹ ہو جاتے ہیں، ان کی کھلی درخواستیں بند اور آفرز واپس ہو جاتی ہیں؛ بک شدہ کام تب تک رہتے ہیں جب تک آپ بکنگز صفحے سے منسوخ نہ کریں۔'
        )}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <Input
          label={t('Search', 'تلاش')}
          placeholder={t('Name, email or phone', 'نام، ای میل یا فون')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select label={t('Type', 'قسم')} value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}>
          <option value="">{t('Everyone', 'سب')}</option>
          <option value="customer">{t('Customers', 'کسٹمرز')}</option>
          <option value="technician">{t('Professionals', 'پروفیشنلز')}</option>
        </Select>
        <Select label={t('Account', 'اکاؤنٹ')} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">{t('Any', 'کوئی بھی')}</option>
          <option value="active">{t('Active', 'فعال')}</option>
          <option value="suspended">{t('Suspended', 'معطل')}</option>
        </Select>
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description={t('The users could not be loaded.', 'صارفین لوڈ نہیں ہو سکے۔')} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState title={t('Nobody found', 'کوئی نہیں ملا')} description={t('Try another search or filter.', 'کوئی اور تلاش یا فلٹر آزمائیں۔')} />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {query.data.data.map((user) => (
              <li key={user.id}>
                <UserCard user={user} />
              </li>
            ))}
          </ul>
          <Pager pagination={query.data.pagination} page={page} onPage={setPage} />
        </>
      )}
    </>
  );
}

function UserCard({ user }: { user: AdminUser }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const p = user.professional;

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <button type="button" className="flex w-full flex-wrap items-start justify-between gap-3 text-start" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <div>
            <h2 className="font-semibold">
              {user.name}
              {p && p.business_name !== user.name ? <span className="ml-2 font-normal text-ink-500">· {p.business_name}</span> : null}
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {user.role === 'technician' ? t('Professional', 'پروفیشنل') : t('Customer', 'کسٹمر')}
              {user.city ? ` · ${user.city}` : ''} · {t('Joined', 'شامل')} {formatAdminDate(user.joined_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {p && p.strikes > 0 ? (
              <Badge tone={p.strikes >= p.max_strikes ? 'danger' : 'warn'}>{t(`${p.strikes} strike(s)`, `${p.strikes} اسٹرائیک`)}</Badge>
            ) : null}
            {user.reports_against > 0 ? <Badge tone="warn">{t(`${user.reports_against} report(s)`, `${user.reports_against} شکایات`)}</Badge> : null}
            <Badge tone={user.is_suspended ? 'danger' : 'safe'}>{user.is_suspended ? t('Suspended', 'معطل') : t('Active', 'فعال')}</Badge>
            <ChevronDown className={open ? 'h-4 w-4 rotate-180 transition-transform' : 'h-4 w-4 transition-transform'} aria-hidden="true" />
          </div>
        </button>

        {open ? <UserDetail id={user.id} /> : null}
      </CardBody>
    </Card>
  );
}

function UserDetail({ id }: { id: string }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const overview = queryClient.getQueryData<{ permissions?: Record<string, boolean> }>(['admin-overview']);
  const can = overview?.permissions ?? {};

  const detail = useQuery({ queryKey: ['admin-user', id], queryFn: () => adminApi.user(id) });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
    void queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
  };
  const onError = (error: unknown) => toast.error(errorText(error, t('That did not work. Please try again.', 'یہ نہیں ہو سکا۔ دوبارہ کوشش کریں۔')));

  const suspend = useMutation({
    mutationFn: () => adminApi.suspendUser(id, reason.trim()),
    onSuccess: (r) => { toast.success(r.message); setReason(''); refresh(); },
    onError,
  });
  const restore = useMutation({ mutationFn: () => adminApi.restoreUser(id), onSuccess: (r) => { toast.success(r.message); refresh(); }, onError });
  const clear = useMutation({
    mutationFn: () => adminApi.clearStrikes(id, note.trim()),
    onSuccess: (r) => { toast.success(r.message); setNote(''); refresh(); },
    onError,
  });

  if (detail.isPending) return <SkeletonCard />;
  if (detail.isError || !detail.data) {
    return <ErrorState description={t('Could not load this person.', 'یہ صارف لوڈ نہیں ہو سکا۔')} onRetry={() => detail.refetch()} />;
  }
  const u = detail.data;
  const p = u.professional;

  return (
    <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-3 text-sm">
      <div className="flex flex-wrap gap-4 text-ink-600">
        {u.email ? (
          <a href={`mailto:${u.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {u.email}
          </a>
        ) : null}
        {u.phone ? (
          <a href={`tel:${u.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {u.phone}
          </a>
        ) : null}
        <span>{t('Last sign-in', 'آخری سائن ان')}: {formatAdminDate(u.last_login_at) || t('never', 'کبھی نہیں')}</span>
      </div>

      {p ? (
        <div className="grid gap-2 rounded-[var(--radius-control)] border border-[var(--border)] p-3 sm:grid-cols-4">
          <Stat label={t('Verification', 'تصدیق')} value={p.verification ?? '-'} />
          <Stat label={t('Completed / cancelled', 'مکمل / منسوخ')} value={`${p.completed_jobs} / ${p.cancelled_jobs}`} />
          <Stat
            label={t('Rating', 'ریٹنگ')}
            value={p.rating_count > 0 ? <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[#D97706]" aria-hidden="true" />{p.rating_average} ({p.rating_count})</span> : '-'}
          />
          <Stat label={t('Strikes', 'اسٹرائیکس')} value={`${p.strikes} / ${p.max_strikes}${p.strikes >= p.max_strikes ? ` · ${t('cannot send offers', 'آفر نہیں بھیج سکتے')}` : ''}`} />
        </div>
      ) : null}

      {u.is_suspended && u.status_reason ? (
        <p className="rounded-[var(--radius-control)] bg-[#FEE2E2] px-3 py-2 text-[#991B1B]">
          <span className="font-semibold">{t('Suspended because', 'معطلی کی وجہ')}: </span>
          {u.status_reason}
        </p>
      ) : null}

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
          {t('Recent jobs', 'حالیہ کام')}
          {u.active_bookings > 0 ? ` · ${t(`${u.active_bookings} in progress`, `${u.active_bookings} جاری`)}` : ''}
        </p>
        {u.bookings.length === 0 ? (
          <p className="text-ink-500">{t('No jobs yet.', 'ابھی کوئی کام نہیں۔')}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {u.bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/admin/bookings?search=${encodeURIComponent(b.reference)}`} className="font-medium hover:underline">
                  {b.reference} · {b.category}
                </Link>
                <span className="text-ink-500">
                  {b.status_label} · {b.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {u.reports.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">{t('Reports against them', 'ان کے خلاف شکایات')}</p>
          <ul className="flex flex-col gap-1 text-ink-600">
            {u.reports.map((r, i) => (
              <li key={i}>
                {formatAdminDate(r.created_at)} · <span className="font-semibold">{r.reason}</span>
                {r.details ? ` · ${r.details}` : ''} ({r.status})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {can.manage_users ? (
        u.is_suspended ? (
          <Button size="sm" variant="secondary" className="self-start" onClick={() => restore.mutate()} disabled={restore.isPending}>
            {t('Restore account', 'اکاؤنٹ بحال کریں')}
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Textarea
              label={t('Reason for suspending (they see it when they try to sign in)', 'معطلی کی وجہ (سائن ان کرتے وقت انہیں نظر آئے گی)')}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
            />
            <Button
              size="sm"
              variant="danger"
              className="self-start"
              disabled={suspend.isPending || reason.trim().length < 5}
              onClick={() => {
                if (window.confirm(t(`Suspend ${u.name}? They will be signed out everywhere.`, `${u.name} کو معطل کریں؟ وہ ہر جگہ سے سائن آؤٹ ہو جائیں گے۔`))) suspend.mutate();
              }}
            >
              {t('Suspend account', 'اکاؤنٹ معطل کریں')}
            </Button>
          </div>
        )
      ) : null}

      {can.clear_strikes && p && p.strikes > 0 ? (
        <div className="flex flex-col gap-2">
          <Input label={t('Why clear the strikes?', 'اسٹرائیکس کیوں ختم کر رہے ہیں؟')} value={note} onChange={(event) => setNote(event.target.value)} />
          <Button size="sm" variant="secondary" className="self-start" disabled={clear.isPending || note.trim().length < 3} onClick={() => clear.mutate()}>
            {t('Clear strikes', 'اسٹرائیکس ختم کریں')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
