'use client';

import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/Button';
import type { Pagination } from '@/lib/api/types';

/** Small pieces shared by the admin Users and Bookings pages. */

export function formatAdminDate(value: string | null | undefined): string {
  return value ? new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '';
}

/** The `?search=` a page was opened with (admin pages run only in the browser). */
export function initialSearch(): string {
  return typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('search') ?? '';
}

/** A value that settles a moment after typing stops, so search does not fire on every key. */
export function useDebounced<T>(value: T, ms = 350): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return settled;
}

export function Pager({ pagination, page, onPage }: { pagination?: Pagination; page: number; onPage: (page: number) => void }) {
  const t = useT();
  if (!pagination || (pagination.last_page ?? 1) <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-ink-600">
      <span>
        {t(
          `Page ${page} of ${pagination.last_page ?? '?'} · ${pagination.total ?? '?'} in total`,
          `صفحہ ${page} از ${pagination.last_page ?? '?'} · کل ${pagination.total ?? '?'}`
        )}
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          {t('Previous', 'پچھلا')}
        </Button>
        <Button size="sm" variant="secondary" disabled={!pagination.has_more} onClick={() => onPage(page + 1)}>
          {t('Next', 'اگلا')}
        </Button>
      </div>
    </div>
  );
}

export function Timeline({ steps }: { steps: Array<{ status: string; actor_role: string | null; note: string | null; at: string | null }> }) {
  return (
    <ol className="flex flex-col gap-1 text-xs text-ink-600">
      {steps.map((step, index) => (
        <li key={index}>
          {formatAdminDate(step.at)} · <span className="font-semibold">{step.status.replaceAll('_', ' ')}</span>
          {step.actor_role ? ` (${step.actor_role === 'technician' ? 'professional' : step.actor_role})` : ''}
          {step.note ? ` · ${step.note}` : ''}
        </li>
      ))}
    </ol>
  );
}

export function Distance({ label, metres, far }: { label: string; metres: number | null; far: boolean }) {
  const t = useT();
  if (metres === null) return null;
  const text = metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${metres} m`;

  return (
    <span className={far ? 'inline-flex items-center gap-1 font-semibold text-danger-700' : 'inline-flex items-center gap-1'}>
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
      {label}: {text} {t('from the address', 'پتے سے')}
      {far ? ` (${t('far', 'دور')})` : ''}
    </span>
  );
}
