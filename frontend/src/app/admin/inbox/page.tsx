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
import type { AdminContactMessage } from '@/lib/api/types';

/** Messages from the public contact form. */
export default function AdminInboxPage() {
  const t = useT();
  const [status, setStatus] = useState('new');

  const query = useQuery({
    queryKey: ['admin-contact', status],
    queryFn: () => adminApi.contactMessages({ status: status || undefined }),
    staleTime: 15_000,
  });

  return (
    <>
      <AdminPageHeader
        title={t('Contact inbox', 'رابطہ ان باکس')}
        description={t('Messages sent from the contact page. Replying by email is still the quickest route; marking a message handled keeps the queue honest.', 'رابطہ صفحے سے بھیجے گئے پیغامات۔ ای میل کے ذریعے جواب دینا اب بھی تیز ترین طریقہ ہے؛ پیغام کو نمٹا گیا نشان زد کرنے سے فہرست درست رہتی ہے۔')}
      />

      <div className="mb-4 max-w-xs">
        <Select label={t('Show', 'دکھائیں')} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="new">{t('New', 'نیا')}</option>
          <option value="in_progress">{t('In progress', 'جاری')}</option>
          <option value="handled">{t('Handled', 'نمٹا گیا')}</option>
          <option value="">{t('Everything', 'سب کچھ')}</option>
        </Select>
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description={t('The inbox could not be loaded.', 'ان باکس لوڈ نہیں ہو سکا۔')} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState title={t('Nothing here', 'یہاں کچھ نہیں')} description={t('No messages with that status.', 'اس حالت کے ساتھ کوئی پیغام نہیں۔')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.data.map((message) => (
            <li key={message.id}>
              <MessageCard message={message} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function MessageCard({ message }: { message: AdminContactMessage }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState(message.internal_note ?? '');

  const update = useMutation({
    mutationFn: (input: Record<string, unknown>) => adminApi.updateContactMessage(message.id, input),
    onSuccess: (response) => {
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: () => toast.error(t('Could not update that message.', 'وہ پیغام اپ ڈیٹ نہیں ہو سکا۔')),
  });

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{message.subject}</h2>
            <p className="mt-0.5 text-sm text-ink-600">
              {message.name}
              {message.created_at
                ? ` · ${new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(message.created_at))}`
                : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{message.topic}</Badge>
            <Badge tone={message.status === 'handled' ? 'safe' : message.status === 'in_progress' ? 'info' : 'warn'}>
              {message.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{message.message}</p>

        <div className="flex flex-wrap gap-4 text-sm">
          <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="inline-flex items-center gap-1.5 font-medium text-[#00824A] hover:text-[#15803D]">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {message.email}
          </a>
          {message.phone ? (
            <a href={`tel:${message.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-ink-600 hover:text-foreground">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {message.phone}
            </a>
          ) : null}
        </div>

        <Textarea
          label={t('Internal note', 'اندرونی نوٹ')}
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint={t('Only staff see this.', 'صرف عملہ یہ دیکھتا ہے۔')}
        />

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" loading={update.isPending} onClick={() => update.mutate({ internal_note: note })}>
            {t('Save note', 'نوٹ محفوظ کریں')}
          </Button>
          {message.status !== 'in_progress' ? (
            <Button size="sm" variant="secondary" loading={update.isPending} onClick={() => update.mutate({ status: 'in_progress', internal_note: note })}>
              {t('Mark in progress', 'جاری کے طور پر نشان زد کریں')}
            </Button>
          ) : null}
          {message.status !== 'handled' ? (
            <Button size="sm" loading={update.isPending} onClick={() => update.mutate({ status: 'handled', internal_note: note })}>
              {t('Mark handled', 'نمٹا گیا نشان زد کریں')}
            </Button>
          ) : (
            <span className="self-center text-sm text-ink-500">
              {t('Handled', 'نمٹا گیا')}{message.handled_by ? t(` by ${message.handled_by}`, ` بذریعہ ${message.handled_by}`) : ''}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
