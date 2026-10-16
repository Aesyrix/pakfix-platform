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
import type { AdminVerification } from '@/lib/api/types';

const STATUS_URDU: Record<string, string> = {
  pending: 'زیرِ جائزہ',
  verified: 'تصدیق شدہ',
  rejected: 'مسترد',
  not_submitted: 'جمع نہیں کرایا',
};

const DOCUMENT_LABELS: Record<string, [string, string]> = {
  cnic_front: ['CNIC front', 'شناختی کارڈ سامنے'],
  cnic_back: ['CNIC back', 'شناختی کارڈ پیچھے'],
  photo: ['Selfie', 'سیلفی'],
  certificate: ['Trade certificate', 'ہنر کا سرٹیفکیٹ'],
};

function formatDate(value: string | null): string {
  return value ? new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '';
}

/** Professionals waiting for a person to check their CNIC and selfie. */
export default function AdminVerificationsPage() {
  const t = useT();
  const [status, setStatus] = useState('pending');

  const query = useQuery({
    queryKey: ['admin-verifications', status],
    queryFn: () => adminApi.verifications({ status }),
    staleTime: 15_000,
  });

  return (
    <>
      <AdminPageHeader
        title={t('Verifications', 'تصدیق')}
        description={t(
          'Professionals who submitted their CNIC and a selfie. Check the name and photo match, then approve so they can receive jobs, or send it back with a reason they will see.',
          'وہ پروفیشنلز جنہوں نے شناختی کارڈ اور سیلفی جمع کرائی۔ نام اور تصویر ملائیں، پھر منظور کریں تاکہ انہیں کام ملیں، یا وجہ کے ساتھ واپس بھیجیں جو انہیں نظر آئے گی۔'
        )}
      />

      <div className="mb-4 max-w-xs">
        <Select label={t('Show', 'دکھائیں')} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="pending">{t('Waiting for review', 'جائزے کے منتظر')}</option>
          <option value="rejected">{t('Sent back', 'واپس بھیجے گئے')}</option>
          <option value="verified">{t('Verified', 'تصدیق شدہ')}</option>
          <option value="not_submitted">{t('Not submitted yet', 'ابھی جمع نہیں کرایا')}</option>
        </Select>
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description={t('The queue could not be loaded.', 'فہرست لوڈ نہیں ہو سکی۔')} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState
          title={t('Nothing here', 'یہاں کچھ نہیں')}
          description={t('No professionals with that status.', 'اس حالت کے ساتھ کوئی پروفیشنل نہیں۔')}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.data.map((item) => (
            <li key={item.id}>
              <VerificationCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function VerificationCard({ item }: { item: AdminVerification }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const tone = item.status === 'verified' ? 'safe' : item.status === 'rejected' ? 'danger' : item.status === 'pending' ? 'warn' : 'neutral';

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{item.name}</h2>
            <p className="mt-0.5 text-sm text-ink-600">
              {[item.city, item.trades.join(', '), item.years_experience ? t(`${item.years_experience} yrs experience`, `${item.years_experience} سال تجربہ`) : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {item.submitted_at ? (
              <p className="mt-0.5 text-xs text-ink-500">
                {t('Submitted', 'جمع کرایا')} {formatDate(item.submitted_at)}
              </p>
            ) : null}
          </div>
          <Badge tone={tone}>{t(item.status.replace('_', ' '), STATUS_URDU[item.status] ?? item.status)}</Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {item.phone ? (
            <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 text-ink-600 hover:text-foreground">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {item.phone}
            </a>
          ) : null}
          {item.email ? (
            <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 text-ink-600 hover:text-foreground">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {item.email}
            </a>
          ) : null}
          {item.cnic_masked ? (
            <span className="text-ink-600">
              {t('CNIC', 'شناختی کارڈ')}: <span className="font-mono">{item.cnic_masked}</span>
            </span>
          ) : null}
        </div>

        {item.rejection_reason ? (
          <p className="text-sm text-[#991B1B]">
            {t('Sent back', 'واپس بھیجا گیا')}: {item.rejection_reason}
          </p>
        ) : null}

        <div>
          <Button size="sm" variant="secondary" onClick={() => setOpen((value) => !value)}>
            {open ? t('Hide documents', 'دستاویزات چھپائیں') : t('Review documents', 'دستاویزات دیکھیں')}
          </Button>
        </div>

        {open ? <ReviewPanel item={item} /> : null}
      </CardBody>
    </Card>
  );
}

function ReviewPanel({ item }: { item: AdminVerification }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  const detail = useQuery({
    queryKey: ['admin-verification', item.id],
    queryFn: () => adminApi.verification(item.id),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-verification', item.id] });
    void queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
  };

  const approve = useMutation({
    mutationFn: () => adminApi.approveVerification(item.id),
    onSuccess: (response) => {
      toast.success(response.message);
      refresh();
    },
    onError: () => toast.error(t('Could not approve.', 'منظور نہیں ہو سکا۔')),
  });

  const reject = useMutation({
    mutationFn: () => adminApi.rejectVerification(item.id, reason.trim()),
    onSuccess: (response) => {
      toast.success(response.message);
      setReason('');
      refresh();
    },
    onError: () => toast.error(t('Could not send it back. Give a reason of at least 5 characters.', 'واپس نہیں بھیجا جا سکا۔ کم از کم 5 حروف کی وجہ لکھیں۔')),
  });

  if (detail.isPending) return <SkeletonCard />;
  if (detail.isError || !detail.data) {
    return <ErrorState description={t('Documents could not be loaded.', 'دستاویزات لوڈ نہیں ہو سکیں۔')} onRetry={() => detail.refetch()} />;
  }

  const d = detail.data;
  const pending = d.status === 'pending';

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-surface-muted p-4">
      {d.documents.length === 0 ? (
        <p className="text-sm text-ink-600">{t('No documents uploaded yet.', 'ابھی کوئی دستاویز اپ لوڈ نہیں ہوئی۔')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {d.documents.map((doc) => {
            const [en, ur] = DOCUMENT_LABELS[doc.type] ?? [doc.type, doc.type];
            return (
              <figure key={doc.id} className="flex flex-col gap-1.5">
                <figcaption className="text-xs font-medium text-ink-600">{t(en, ur)}</figcaption>
                {doc.mime_type === 'application/pdf' ? (
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#00824A] underline">
                    {t('Open PDF', 'پی ڈی ایف کھولیں')}
                  </a>
                ) : (
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    {/* Streamed from the private disk to signed-in reviewers only. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doc.url}
                      alt={t(en, ur)}
                      className="aspect-[4/3] w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-surface object-contain"
                    />
                  </a>
                )}
              </figure>
            );
          })}
        </div>
      )}

      {d.bio ? <p className="text-sm text-ink-700">{d.bio}</p> : null}

      {pending ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" loading={approve.isPending} onClick={() => approve.mutate()}>
              {t('Approve', 'منظور کریں')}
            </Button>
          </div>
          <Textarea
            label={t('Or send back with a reason', 'یا وجہ کے ساتھ واپس بھیجیں')}
            rows={2}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            hint={t('The professional sees this and can fix it, e.g. "The CNIC photo is blurry."', 'پروفیشنل یہ دیکھے گا اور درست کر سکے گا، مثلاً "شناختی کارڈ کی تصویر دھندلی ہے۔"')}
          />
          <div>
            <Button size="sm" variant="danger" loading={reject.isPending} disabled={reason.trim().length < 5} onClick={() => reject.mutate()}>
              {t('Send back', 'واپس بھیجیں')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
