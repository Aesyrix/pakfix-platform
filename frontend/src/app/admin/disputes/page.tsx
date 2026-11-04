'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { useT } from '@/components/i18n/LocaleProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Checkbox, Select, Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { adminApi } from '@/lib/api/endpoints';
import type { AdminDispute, AdminDisputePerson } from '@/lib/api/types';

const KINDS: Record<AdminDispute['kind'], [string, string]> = {
  problem: ['Problem with the job', 'کام میں مسئلہ'],
  no_show: ['Professional did not come', 'پروفیشنل نہیں آئے'],
  not_paid: ['Customer has not paid', 'کسٹمر نے ادائیگی نہیں کی'],
};

const VIA: Record<string, [string, string]> = {
  code: ["Finished with the customer's code", 'کسٹمر کے کوڈ سے مکمل'],
  customer: ['Customer marked it done', 'کسٹمر نے مکمل کیا'],
  professional: ['Professional marked it done (no code)', 'پروفیشنل نے مکمل کیا (کوڈ کے بغیر)'],
  auto: ['Marked done automatically', 'خودبخود مکمل'],
  admin: ['Decided by PakFix', 'پاک فکس کا فیصلہ'],
};

function formatDate(value: string | null): string {
  return value ? new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '';
}

function distance(metres: number | null): string | null {
  if (metres === null) return null;
  return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${metres} m`;
}

/** Disputes on booked jobs. The job waits until PakFix decides. */
export default function AdminDisputesPage() {
  const t = useT();
  const [status, setStatus] = useState('open');

  const query = useQuery({
    queryKey: ['admin-disputes', status],
    queryFn: () => adminApi.disputes({ status }),
    staleTime: 15_000,
  });

  return (
    <>
      <AdminPageHeader
        title={t('Disputes', 'تنازعات')}
        description={t(
          'Problems with booked jobs. The job stays on hold until you decide: complete it (the professional is owed) or cancel it (nothing is owed). Give a strike if the professional was at fault; 3 strikes stop them sending offers. Aim to decide within 24 hours.',
          'بک شدہ کاموں کے مسائل۔ آپ کے فیصلے تک کام رکا رہتا ہے: مکمل کریں (پروفیشنل کو ادائیگی واجب) یا منسوخ کریں (کچھ واجب نہیں)۔ غلطی پروفیشنل کی ہو تو اسٹرائیک دیں؛ 3 اسٹرائیکس پر وہ آفر نہیں بھیج سکتے۔ 24 گھنٹے میں فیصلہ کرنے کی کوشش کریں۔'
        )}
      />

      <div className="mb-4 max-w-xs">
        <Select label={t('Show', 'دکھائیں')} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="open">{t('Waiting for a decision', 'فیصلے کے منتظر')}</option>
          <option value="resolved">{t('Decided', 'فیصلہ ہو گیا')}</option>
        </Select>
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description={t('The disputes could not be loaded.', 'تنازعات لوڈ نہیں ہو سکے۔')} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState title={t('Nothing here', 'یہاں کچھ نہیں')} description={t('No disputes with that status.', 'اس حالت کا کوئی تنازع نہیں۔')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.data.map((dispute) => (
            <li key={dispute.id}>
              <DisputeCard dispute={dispute} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function DisputeCard({ dispute }: { dispute: AdminDispute }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [strike, setStrike] = useState(false);
  const [kind, kindUr] = KINDS[dispute.kind] ?? [dispute.kind, dispute.kind];
  const open = dispute.status === 'open' || dispute.status === 'under_review';
  const b = dispute.booking;

  const decide = useMutation({
    mutationFn: (outcome: 'complete' | 'cancel') => adminApi.decideDispute(dispute.id, { outcome, strike, note: note.trim() }),
    onSuccess: (response) => {
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: (error) => {
      const first = error instanceof ApiError ? Object.values(error.errors)[0]?.[0] : undefined;
      toast.error(first ?? t('Could not save the decision.', 'فیصلہ محفوظ نہیں ہو سکا۔'));
    },
  });

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{t(kind, kindUr)}</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {dispute.reference} · {formatDate(dispute.created_at)}
              {b ? ` · ${t('Job', 'کام')} ${b.reference} · ${b.total}` : ''}
            </p>
          </div>
          <Badge tone={open ? 'warn' : 'safe'}>
            {open
              ? t('Waiting', 'منتظر')
              : dispute.outcome === 'complete'
                ? t('Completed', 'مکمل کیا')
                : t('Cancelled', 'منسوخ کیا')}
          </Badge>
        </div>

        <p className="text-sm">
          <span className="font-semibold">
            {dispute.raised_by_role === 'technician' ? t('The professional said', 'پروفیشنل نے کہا') : t('The customer said', 'کسٹمر نے کہا')}:{' '}
          </span>
          {dispute.description}
        </p>

        {b ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <PersonBox title={t('Customer', 'کسٹمر')} person={b.customer} />
              {b.professional ? (
                <PersonBox
                  title={t('Professional', 'پروفیشنل')}
                  person={b.professional}
                  extra={t(
                    `${b.professional.completed_jobs} completed · ${b.professional.cancelled_jobs} cancelled · ${b.professional.strikes} strike(s)`,
                    `${b.professional.completed_jobs} مکمل · ${b.professional.cancelled_jobs} منسوخ · ${b.professional.strikes} اسٹرائیک`
                  )}
                  warn={b.professional.strikes > 0}
                />
              ) : null}
            </div>

            <div className="rounded-[var(--radius-control)] border border-[var(--border)] p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t('The job', 'کام')}</p>
              <p className="mt-1">
                <span className="font-semibold">{b.category}</span> · {b.problem_description}
              </p>
              <p className="mt-1 text-ink-600">{b.address_line}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {b.completed_via && VIA[b.completed_via] ? <span>{t(...VIA[b.completed_via])}</span> : null}
                <Position label={t('Arrived', 'پہنچے')} metres={b.arrived_distance_m} far={b.arrived_far} />
                <Position label={t('Finished', 'مکمل')} metres={b.completed_distance_m} far={b.completed_far} />
              </div>
              <ol className="mt-3 flex flex-col gap-1 border-t border-[var(--border)] pt-2 text-xs text-ink-600">
                {b.timeline.map((step, index) => (
                  <li key={index}>
                    {formatDate(step.at)} · <span className="font-semibold">{step.status.replaceAll('_', ' ')}</span>
                    {step.actor_role ? ` (${step.actor_role === 'technician' ? 'professional' : step.actor_role})` : ''}
                    {step.note ? ` · ${step.note}` : ''}
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : null}

        {open ? (
          <div className="flex flex-col gap-3">
            <Textarea
              label={t('Your decision and why (both sides may be told)', 'آپ کا فیصلہ اور وجہ (دونوں فریقوں کو بتایا جا سکتا ہے)')}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
            />
            <Checkbox
              label={t('Give the professional a strike', 'پروفیشنل کو اسٹرائیک دیں')}
              checked={strike}
              onChange={(event) => setStrike(event.target.checked)}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => decide.mutate('complete')} disabled={decide.isPending || note.trim().length < 3}>
                {t('Complete the job', 'کام مکمل کریں')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => decide.mutate('cancel')} disabled={decide.isPending || note.trim().length < 3}>
                {t('Cancel the job', 'کام منسوخ کریں')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-600">
            {dispute.resolution_note ? `${dispute.resolution_note} · ` : ''}
            {dispute.strike_given ? `${t('Strike given', 'اسٹرائیک دی گئی')} · ` : ''}
            {dispute.resolved_by ? `${dispute.resolved_by}, ` : ''}
            {formatDate(dispute.resolved_at)}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function Position({ label, metres, far }: { label: string; metres: number | null; far: boolean }) {
  const t = useT();
  const text = distance(metres);
  if (text === null) return null;

  return (
    <span className={far ? 'inline-flex items-center gap-1 font-semibold text-[#991B1B]' : 'inline-flex items-center gap-1'}>
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
      {label}: {text} {t('from the address', 'پتے سے')}
      {far ? ` (${t('far', 'دور')})` : ''}
    </span>
  );
}

function PersonBox({ title, person, extra, warn }: { title: string; person: AdminDisputePerson | null; extra?: string; warn?: boolean }) {
  if (!person) return null;

  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</p>
      <p className="mt-1 font-semibold">{person.name}</p>
      {person.email ? (
        <a href={`mailto:${person.email}`} className="mt-1 inline-flex items-center gap-1 text-ink-600 hover:text-foreground">
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          {person.email}
        </a>
      ) : null}
      {extra ? <p className={warn ? 'mt-1 text-xs font-semibold text-[#991B1B]' : 'mt-1 text-xs text-ink-600'}>{extra}</p> : null}
    </div>
  );
}
