'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  AvailabilityPicker,
  availabilityComplete,
  availabilityPayload,
  type AvailabilityChoice,
} from '@/components/account/AvailabilityPicker';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { useT } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { accountApi, type ProAvailability } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils/cn';

/**
 * When the professional gets new-job alerts: the Available switch, working
 * hours and emergency jobs. Same settings as the app (Account › Availability).
 */
export default function ProAvailabilityPage() {
  const t = useT();
  const query = useQuery({ queryKey: ['pro-availability'], queryFn: accountApi.proAvailability, staleTime: 15_000 });

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader title="Availability" titleUr="دستیابی" />
      {query.isPending ? (
        <SkeletonCard />
      ) : query.isError || !query.data ? (
        <ErrorState description={t('Your availability could not be loaded.', 'آپ کی دستیابی لوڈ نہیں ہو سکی۔')} onRetry={() => query.refetch()} />
      ) : (
        <AvailabilityForm initial={query.data} />
      )}
    </Container>
  );
}

function toChoice(a: ProAvailability): AvailabilityChoice {
  return {
    work_hours: a.work_hours,
    work_start: a.work_hours === 'custom' ? (a.work_start ?? '') : '',
    work_end: a.work_hours === 'custom' ? (a.work_end ?? '') : '',
    offers_emergency_service: a.offers_emergency_service,
  };
}

function AvailabilityForm({ initial }: { initial: ProAvailability }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(initial);
  const [choice, setChoice] = useState<AvailabilityChoice>(() => toChoice(initial));
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(availabilityPayload(choice)) !== JSON.stringify(availabilityPayload(toChoice(saved)));

  function onSaved(next: ProAvailability) {
    setSaved(next);
    queryClient.setQueryData(['pro-availability'], next);
  }

  const toggle = useMutation({
    mutationFn: (on: boolean) => accountApi.saveProAvailability({ is_available: on }),
    onSuccess: (r) => onSaved(r.data),
    onError: () => toast.error(t('Could not change it. Please try again.', 'تبدیل نہیں ہو سکا۔ دوبارہ کوشش کریں۔')),
  });

  const save = useMutation({
    mutationFn: () => accountApi.saveProAvailability(availabilityPayload(choice)),
    onSuccess: (r) => {
      onSaved(r.data);
      setChoice(toChoice(r.data));
      toast.success(t('Availability saved.', 'دستیابی محفوظ ہو گئی۔'));
    },
    onError: (e) => {
      const first = e instanceof ApiError ? (e.errors.work_end?.[0] ?? e.errors.work_start?.[0] ?? e.message) : null;
      setError(first ?? t('Could not save. Please try again.', 'محفوظ نہیں ہو سکا۔ دوبارہ کوشش کریں۔'));
    },
  });

  const [status, tone] = !saved.is_available
    ? [t('Paused: no job alerts', 'رکا ہوا: کوئی الرٹ نہیں'), 'text-warn-700']
    : !saved.within_hours_now
      ? [t('Outside your hours: alerts start again with your hours', 'آپ کے اوقات سے باہر: اوقات شروع ہوتے ہی الرٹ دوبارہ آئیں گے'), 'text-ink-500']
      : [t("On: you're getting job alerts", 'آن: آپ کو کام کے الرٹ مل رہے ہیں'), 'text-brand-700'];

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <Card className={cn(!saved.is_available && 'border-warn-300 bg-warn-50')}>
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{t('Available for new jobs', 'نئے کام کے لیے دستیاب')}</p>
            <p className={cn('mt-0.5 text-sm font-medium', tone)}>{status}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={saved.is_available}
            aria-label={t('Available for new jobs', 'نئے کام کے لیے دستیاب')}
            disabled={toggle.isPending}
            onClick={() => toggle.mutate(!saved.is_available)}
            className={cn(
              'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              saved.is_available ? 'bg-brand-600' : 'bg-ink-300'
            )}
          >
            <span
              className={cn(
                'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all',
                saved.is_available ? 'start-6' : 'start-1'
              )}
            />
          </button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <AvailabilityPicker
            value={choice}
            error={error}
            onChange={(next) => {
              setChoice(next);
              setError(null);
            }}
          />
          <Button
            className="self-start"
            loading={save.isPending}
            disabled={!dirty}
            onClick={() => {
              if (!availabilityComplete(choice)) {
                setError(t('Choose a start and an end time (they must be different).', 'شروع اور ختم کا وقت چنیں (دونوں مختلف ہوں)۔'));
                return;
              }
              save.mutate();
            }}
          >
            {t('Save changes', 'تبدیلیاں محفوظ کریں')}
          </Button>
        </CardBody>
      </Card>

      <p className="text-sm text-ink-500">
        {t(
          'Outside your hours or while paused you get no alerts, but you can still see nearby jobs and send offers. Times are Pakistan time.',
          'اپنے اوقات سے باہر یا رکنے پر الرٹ نہیں آئیں گے، لیکن آپ قریب کے کام دیکھ کر آفر بھیج سکتے ہیں۔ اوقات پاکستان کے وقت کے مطابق ہیں۔'
        )}
      </p>
    </div>
  );
}
