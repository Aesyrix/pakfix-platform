'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/components/i18n/LocaleProvider';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { accountApi, type ProAvailability } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils/cn';

/**
 * Two pieces shown at the top of the professional's home and Jobs pages,
 * with the same words as the app's Jobs tab:
 *  - what a professional who is not verified yet must do to receive jobs;
 *  - whether job alerts are on right now, with a switch to pause them.
 */

const VERIFICATION_COPY: Record<string, { title: [string, string]; body: [string, string]; action: [string, string] }> = {
  pending: {
    title: ['Verification in review', 'تصدیق زیرِ جائزہ'],
    body: [
      "We're checking your documents, usually within 24 hours. You'll start receiving jobs once you're verified.",
      'ہم آپ کے کاغذات چیک کر رہے ہیں، عموماً 24 گھنٹوں میں۔ تصدیق ہوتے ہی آپ کو کام ملنا شروع ہو جائیں گے۔',
    ],
    action: ['View verification', 'تصدیق دیکھیں'],
  },
  rejected: {
    title: ['Verification needs attention', 'تصدیق پر توجہ درکار'],
    body: [
      'Open Verification to see what to fix and send it again.',
      'تصدیق کھول کر دیکھیں کیا درست کرنا ہے اور دوبارہ بھیجیں۔',
    ],
    action: ['Fix verification', 'تصدیق درست کریں'],
  },
  not_submitted: {
    title: ['Complete verification to receive jobs', 'کام حاصل کرنے کے لیے تصدیق مکمل کریں'],
    body: [
      'Add your trades, CNIC and a selfie, and PakFix will review them. Nearby jobs appear once you are verified.',
      'اپنے کام کی اقسام، شناختی کارڈ اور سیلفی شامل کریں، پاک فکس ان کا جائزہ لے گا۔ تصدیق کے بعد قریب کے کام نظر آئیں گے۔',
    ],
    action: ['Get verified', 'تصدیق کروائیں'],
  },
};

/** Shown until the professional is verified; nothing once they are. */
export function VerificationNotice({ status }: { status: string | undefined }) {
  const t = useT();
  if (!status || status === 'verified' || status === 'suspended') return null;
  const copy = VERIFICATION_COPY[status === 'more_info_requested' ? 'rejected' : status] ?? VERIFICATION_COPY.not_submitted;
  const inReview = status === 'pending';

  return (
    <Card className={cn('border-warn-300', inReview ? 'bg-surface' : 'bg-warn-50')}>
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {inReview ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
          ) : (
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warn-700" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold">{t(...copy.title)}</p>
            <p className="mt-0.5 text-sm text-ink-600">{t(...copy.body)}</p>
          </div>
        </div>
        <ButtonLink href="/pro/verification" size="sm" variant={inReview ? 'secondary' : 'primary'} className="shrink-0">
          {t(...copy.action)}
        </ButtonLink>
      </CardBody>
    </Card>
  );
}

/** Are job alerts on right now, with a switch to pause them; links to the full settings. */
export function AvailabilityStrip() {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['pro-availability'], queryFn: accountApi.proAvailability, staleTime: 15_000 });

  const toggle = useMutation({
    mutationFn: (on: boolean) => accountApi.saveProAvailability({ is_available: on }),
    onSuccess: (r) => queryClient.setQueryData<ProAvailability>(['pro-availability'], r.data),
    onError: () => toast.error(t('Could not change it. Please try again.', 'تبدیل نہیں ہو سکا۔ دوبارہ کوشش کریں۔')),
  });

  const a = query.data;
  if (!a) return null;

  const [status, tone] = !a.is_available
    ? [t('Paused: no job alerts', 'رکا ہوا: کوئی الرٹ نہیں'), 'text-warn-700']
    : !a.within_hours_now
      ? [t('Outside your hours: alerts start again with your hours', 'آپ کے اوقات سے باہر: اوقات شروع ہوتے ہی الرٹ دوبارہ آئیں گے'), 'text-ink-500']
      : [t("On: you're getting job alerts", 'آن: آپ کو کام کے الرٹ مل رہے ہیں'), 'text-brand-700'];

  return (
    <Card className={cn(!a.is_available && 'border-warn-300 bg-warn-50')}>
      <CardBody className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn('h-2.5 w-2.5 shrink-0 rounded-full', !a.is_available ? 'bg-warn-500' : a.within_hours_now ? 'bg-brand-600' : 'bg-ink-400')}
          />
          <div>
            <p className={cn('text-sm font-semibold', tone)}>{status}</p>
            <Link href="/pro/schedule" className="text-xs text-ink-500 underline-offset-2 hover:underline">
              {t('Working hours and emergency jobs', 'کام کے اوقات اور ایمرجنسی کام')}
            </Link>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={a.is_available}
          aria-label={t('Available for new jobs', 'نئے کام کے لیے دستیاب')}
          disabled={toggle.isPending}
          onClick={() => toggle.mutate(!a.is_available)}
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            a.is_available ? 'bg-brand-600' : 'bg-ink-300'
          )}
        >
          <span
            className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', a.is_available ? 'start-6' : 'start-1')}
          />
        </button>
      </CardBody>
    </Card>
  );
}
