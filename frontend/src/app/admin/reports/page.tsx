'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { useT } from '@/components/i18n/LocaleProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select, Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { adminApi } from '@/lib/api/endpoints';
import type { AdminReport, AdminReportPerson } from '@/lib/api/types';

const REASONS: Record<AdminReport['reason'], [string, string]> = {
  harassment: ['Harassment or threats', 'ہراسانی یا دھمکی'],
  inappropriate: ['Inappropriate content', 'نامناسب مواد'],
  spam: ['Spam', 'سپیم'],
  fraud: ['Fraud or scam', 'فراڈ یا دھوکہ'],
  safety: ['Safety concern', 'حفاظت کا مسئلہ'],
  off_platform: ['Asked to pay or talk outside PakFix', 'پاک فکس سے باہر ادائیگی یا رابطے کا کہا'],
  other: ['Something else', 'کچھ اور'],
};

const STATUS: Record<AdminReport['status'], [string, string, 'warn' | 'info' | 'safe' | 'neutral']> = {
  open: ['Open', 'کھلی', 'warn'],
  reviewing: ['Reviewing', 'زیرِ جائزہ', 'info'],
  actioned: ['Action taken', 'کارروائی ہو گئی', 'safe'],
  dismissed: ['Dismissed', 'مسترد', 'neutral'],
};

function formatDate(value: string | null): string {
  return value ? new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '';
}

/** Reports from customers and professionals about each other, oldest first. */
export default function AdminReportsPage() {
  const t = useT();
  const [status, setStatus] = useState('unresolved');

  const query = useQuery({
    queryKey: ['admin-reports', status],
    queryFn: () => adminApi.reports({ status }),
    staleTime: 15_000,
  });

  return (
    <>
      <AdminPageHeader
        title={t('Reports', 'شکایات')}
        description={t(
          'People reporting the customer or professional they worked with. Read what was reported, contact them if needed, and record what you did. App store rules expect a response within 24 hours.',
          'لوگ اس کسٹمر یا پروفیشنل کی شکایت کر رہے ہیں جس کے ساتھ انہوں نے کام کیا۔ شکایت پڑھیں، ضرورت ہو تو رابطہ کریں، اور جو کیا وہ لکھیں۔ ایپ اسٹور کے اصولوں کے مطابق 24 گھنٹے میں جواب ضروری ہے۔'
        )}
      />

      <div className="mb-4 max-w-xs">
        <Select label={t('Show', 'دکھائیں')} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="unresolved">{t('Needs attention', 'توجہ طلب')}</option>
          <option value="actioned">{t('Action taken', 'کارروائی ہو گئی')}</option>
          <option value="dismissed">{t('Dismissed', 'مسترد')}</option>
        </Select>
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description={t('The reports could not be loaded.', 'شکایات لوڈ نہیں ہو سکیں۔')} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState
          title={t('Nothing here', 'یہاں کچھ نہیں')}
          description={t('No reports with that status.', 'اس حالت کی کوئی شکایت نہیں۔')}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.data.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ReportCard({ report }: { report: AdminReport }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState(report.resolution ?? '');
  const [label, labelUr, tone] = STATUS[report.status];
  const [reason, reasonUr] = REASONS[report.reason] ?? [report.reason, report.reason];
  const open = report.status === 'open' || report.status === 'reviewing';

  const update = useMutation({
    mutationFn: (status: AdminReport['status']) => adminApi.updateReport(report.id, { status, resolution: note.trim() || undefined }),
    onSuccess: (response) => {
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: () => toast.error(t('Could not update the report.', 'شکایت اپ ڈیٹ نہیں ہو سکی۔')),
  });

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{t(reason, reasonUr)}</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {formatDate(report.created_at)}
              {report.booking ? ` · ${t('Job', 'کام')} ${report.booking.reference}` : ''}
            </p>
          </div>
          <Badge tone={tone}>{t(label, labelUr)}</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <PersonBox title={t('Reported', 'جس کی شکایت ہوئی')} person={report.reported} extra={
            report.reports_against_user > 1
              ? t(`${report.reports_against_user} reports in total`, `کل ${report.reports_against_user} شکایات`)
              : null
          } />
          <PersonBox title={t('Reported by', 'شکایت کنندہ')} person={report.reporter} />
        </div>

        {report.snapshot ? (
          <blockquote className="rounded-[var(--radius-control)] border-l-4 border-[#DC2626] bg-surface-muted px-4 py-3 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">{t('Reported message', 'رپورٹ شدہ پیغام')}</p>
            {report.snapshot}
          </blockquote>
        ) : null}

        {report.details ? (
          <p className="text-sm">
            <span className="font-semibold">{t('What they said', 'انہوں نے کیا کہا')}: </span>
            {report.details}
          </p>
        ) : null}

        {open ? (
          <div className="flex flex-col gap-3">
            <Textarea
              label={t('What you did (kept on record)', 'آپ نے کیا کیا (ریکارڈ میں رہے گا)')}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => update.mutate('actioned')} disabled={update.isPending}>
                {t('Action taken', 'کارروائی ہو گئی')}
              </Button>
              {report.status === 'open' ? (
                <Button size="sm" variant="secondary" onClick={() => update.mutate('reviewing')} disabled={update.isPending}>
                  {t('Mark as reviewing', 'زیرِ جائزہ کریں')}
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => update.mutate('dismissed')} disabled={update.isPending}>
                {t('Dismiss', 'مسترد کریں')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-600">
            {report.resolution ? `${report.resolution} · ` : ''}
            {report.handled_by ? `${report.handled_by}, ` : ''}
            {formatDate(report.handled_at)}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function PersonBox({ title, person, extra }: { title: string; person: AdminReportPerson | null; extra?: string | null }) {
  const t = useT();
  if (!person) return null;

  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</p>
      <p className="mt-1 font-semibold">
        {person.name}
        {person.role ? <span className="ml-2 font-normal text-ink-500">({t(person.role === 'technician' ? 'professional' : person.role, person.role === 'technician' ? 'پروفیشنل' : 'کسٹمر')})</span> : null}
      </p>
      <div className="mt-1 flex flex-wrap gap-3 text-ink-600">
        {person.phone ? (
          <a href={`tel:${person.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {person.phone}
          </a>
        ) : null}
        {person.email ? (
          <a href={`mailto:${person.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {person.email}
          </a>
        ) : null}
      </div>
      {extra ? <p className="mt-1 text-xs font-semibold text-[#991B1B]">{extra}</p> : null}
    </div>
  );
}
