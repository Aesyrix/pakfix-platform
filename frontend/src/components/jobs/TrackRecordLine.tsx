'use client';

import { Star, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { TrackRecord } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

/**
 * "★ 4.8 (9) · 12 jobs done · 1 cancelled" with its flags, the same for a
 * customer (seen by pros) and a pro (seen by customers). The app's TrackRecordLine.
 */
export function TrackRecordLine({ record, className }: { record: TrackRecord; className?: string }) {
  const t = useAppText();
  const flags = record.flags
    .map((flag) => {
      switch (flag) {
        case 'often_cancels':
          return (
            <Badge key={flag} tone="warn">
              <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
              {t('recOftenCancels')}
            </Badge>
          );
        case 'low_rated':
          return (
            <Badge key={flag} tone="danger">
              {t('recLowRated')}
            </Badge>
          );
        case 'top_rated':
          return (
            <Badge key={flag} tone="brand">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              {t('recTopRated')}
            </Badge>
          );
        case 'new':
          return (
            <Badge key={flag} tone="neutral">
              {t('recNew')}
            </Badge>
          );
        default:
          return null;
      }
    })
    .filter(Boolean);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1 font-bold">
          <Star className="h-4 w-4 fill-warn-500 text-warn-500" aria-hidden="true" />
          {record.rating_average === null
            ? t('recNoRating')
            : t('recRating', { stars: record.rating_average.toFixed(1), count: record.rating_count })}
        </span>
        <span className="text-ink-500">{t('recJobsDone', { n: record.jobs_done })}</span>
        {record.cancellations > 0 ? <span className="text-ink-500">{t('recCancelled', { n: record.cancellations })}</span> : null}
      </p>
      {flags.length > 0 ? <div className="flex flex-wrap gap-1.5">{flags}</div> : null}
    </div>
  );
}

/** "About this customer": the customer's record, for the professional (the app's CustomerRecordCard). */
export function CustomerRecordCard({ record }: { record: TrackRecord }) {
  const t = useAppText();
  const warn = record.flags.includes('often_cancels') || record.flags.includes('low_rated');
  return (
    <div className={cn('rounded-2xl border p-4', warn ? 'border-warn-200 bg-warn-50' : 'border-line bg-surface-muted')}>
      <p className="mb-1.5 text-sm font-semibold">{t('recAboutCustomer')}</p>
      <TrackRecordLine record={record} />
    </div>
  );
}
