'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellRing, Briefcase, CheckCheck, HandCoins, ShieldCheck, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { formatWhen } from '@/components/jobs/JobParts';
import { errorText } from '@/components/jobs/JobDialogs';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { notificationsApi, type InboxNotification } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

const ICONS: Record<string, typeof Bell> = {
  new_job: Briefcase,
  new_offer: HandCoins,
  offer_accepted: BellRing,
  job_update: BellRing,
  verification: ShieldCheck,
  review: Star,
};

/** The notifications inbox: the same list as the app's. */
export function NotificationsInbox() {
  const t = useAppText();
  const { locale } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [marking, setMarking] = useState(false);

  const query = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => notificationsApi.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
    refetchInterval: 30_000,
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const unread = query.data?.pages[0]?.unread ?? 0;

  const refreshCounts = () => {
    void queryClient.invalidateQueries({ queryKey: ['nav-unread-notifications'] });
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  async function open(n: InboxNotification) {
    if (!n.read) {
      try {
        await notificationsApi.read(n.id);
      } catch {
        // Opening the page matters more than the read mark.
      }
      refreshCounts();
    }
    if (n.web_path) router.push(n.web_path);
  }

  async function markAll() {
    setMarking(true);
    try {
      await notificationsApi.readAll();
      refreshCounts();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setMarking(false);
    }
  }

  if (query.isPending) return <SkeletonCard />;
  if (query.isError) return <ErrorState description={t('errorGeneric')} onRetry={() => query.refetch()} />;
  if (items.length === 0) {
    return <EmptyState icon={<Bell className="h-5 w-5" />} title={t('notifEmptyTitle')} description={t('notifEmptyBody')} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {unread > 0 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink-600">{t('notifUnread', { count: unread })}</p>
          <Button variant="ghost" size="sm" onClick={markAll} loading={marking}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {t('notifMarkAllRead')}
          </Button>
        </div>
      ) : null}
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {items.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          const title = locale === 'ur' ? n.title.ur : n.title.en;
          const body = locale === 'ur' ? n.body.ur : n.body.en;
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => open(n)}
                className={cn('flex w-full items-start gap-3 px-4 py-3.5 text-start transition-colors hover:bg-surface-muted', !n.read && 'bg-brand-50/60')}
              >
                <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', n.read ? 'bg-surface-muted text-ink-500' : 'bg-brand-solid text-white')}>
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-sm', n.read ? 'font-medium text-ink-800' : 'font-bold text-ink-900')}>{title}</span>
                  {body ? <span className="mt-0.5 block text-sm text-ink-600">{body}</span> : null}
                  <span className="mt-1 block text-xs text-ink-500">{formatWhen(n.created_at, locale)}</span>
                </span>
                {!n.read ? <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-solid" aria-hidden="true" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {query.hasNextPage ? (
        <div className="text-center">
          <Button variant="secondary" size="sm" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
            {t('notifOlder')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
