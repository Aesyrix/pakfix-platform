'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Flag,
  Inbox,
  MapPin,
  MessageCircleQuestion,
  Newspaper,
  PenLine,
  Scale,
  ShieldCheck,
  Users,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useFormatDate, useT } from '@/components/i18n/LocaleProvider';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { adminApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

type Tone = 'brand' | 'accent' | 'warn' | 'danger';

interface Tile {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  href: string | null;
}

const toneChip: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200/70',
  accent: 'bg-accent-50 text-accent-700 ring-accent-200/70',
  warn: 'bg-warn-50 text-warn-700 ring-warn-200',
  danger: 'bg-danger-50 text-danger-600 ring-danger-200',
};

/** What exists, what needs attention, and who changed what. All live data. */
export default function AdminOverviewPage() {
  const t = useT();
  const formatDate = useFormatDate();
  const user = useAuthStore((state) => state.user);
  const query = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.overview, staleTime: 30_000 });

  if (query.isPending) {
    return (
      <div className="space-y-6" aria-label={t('Loading', 'لوڈ ہو رہا ہے')}>
        <div className="skeleton h-44 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState description={t('The overview could not be loaded.', 'جائزہ لوڈ نہیں ہو سکا۔')} onRetry={() => query.refetch()} />;
  }

  const { content, marketplace, inbox, recent_activity, permissions } = query.data;
  const firstName = user?.name?.split(' ')[0];

  // Rendered only after data loads in the browser, so the hour is the
  // visitor's own and never baked into the static HTML.
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('Good morning', 'صبح بخیر') : hour < 17 ? t('Good afternoon', 'سہ پہر بخیر') : t('Good evening', 'شام بخیر');

  const attention = [
    {
      show: marketplace.pending_professionals > 0,
      label: t('Professionals awaiting review', 'جائزے کے منتظر پروفیشنلز'),
      value: marketplace.pending_professionals,
      icon: ShieldCheck,
      href: permissions.verifications ? '/admin/verifications' : null,
      tone: 'warn' as Tone,
    },
    {
      show: inbox.unhandled_contact_messages > 0,
      label: t('Unanswered messages', 'غیر جوابدہ پیغامات'),
      value: inbox.unhandled_contact_messages,
      icon: Inbox,
      href: permissions.inbox ? '/admin/inbox' : null,
      tone: 'warn' as Tone,
    },
    {
      show: (inbox.open_reports ?? 0) > 0,
      label: t('Open reports', 'کھلی شکایات'),
      value: inbox.open_reports ?? 0,
      icon: Flag,
      href: permissions.reports ? '/admin/reports' : null,
      tone: 'danger' as Tone,
    },
    {
      show: (inbox.open_disputes ?? 0) > 0,
      label: t('Open disputes', 'کھلے تنازعات'),
      value: inbox.open_disputes ?? 0,
      icon: Scale,
      href: permissions.disputes ? '/admin/disputes' : null,
      tone: 'danger' as Tone,
    },
  ].filter((item) => item.show);

  const marketplaceTiles: Tile[] = [
    { label: t('Verified professionals', 'تصدیق شدہ پروفیشنلز'), value: marketplace.verified_professionals, hint: t(`${marketplace.pending_professionals} awaiting review`, `${marketplace.pending_professionals} زیرِ جائزہ`), icon: ShieldCheck, href: permissions.verifications ? '/admin/verifications' : null },
    { label: t('Customers', 'گاہک'), value: marketplace.customers, icon: Users, href: permissions.users ? '/admin/users' : null },
    { label: t('Unanswered messages', 'غیر جوابدہ پیغامات'), value: inbox.unhandled_contact_messages, icon: Inbox, href: permissions.inbox ? '/admin/inbox' : null },
    { label: t('Local SEO pages', 'مقامی SEO صفحات'), value: content.local_pages, hint: t('Service and city pairs with professionals', 'سروس اور شہر کے جوڑے پروفیشنلز کے ساتھ'), icon: MapPin, href: null },
  ];

  const contentTiles: Tile[] = [
    { label: t('Published guides', 'شائع شدہ گائیڈز'), value: content.published_posts, hint: t(`${content.draft_posts} drafts`, `${content.draft_posts} ڈرافٹ`), icon: Newspaper, href: permissions.blog ? '/admin/blog' : null },
    { label: t('Pages', 'صفحات'), value: content.pages, icon: FileText, href: permissions.content ? '/admin/pages' : null },
    { label: t('FAQs', 'عام سوالات'), value: content.faqs, icon: MessageCircleQuestion, href: permissions.content ? '/admin/faqs' : null },
    { label: t('Active services', 'فعال خدمات'), value: content.active_categories, icon: Wrench, href: permissions.services ? '/admin/services' : null },
  ];

  const quickActions = [
    permissions.blog && { href: '/admin/blog', label: t('Write a guide', 'گائیڈ لکھیں'), icon: PenLine },
    permissions.verifications && { href: '/admin/verifications', label: t('Review professionals', 'پروفیشنلز کا جائزہ'), icon: ShieldCheck },
    permissions.inbox && { href: '/admin/inbox', label: t('Open inbox', 'ان باکس کھولیں'), icon: Inbox },
  ].filter(Boolean) as Array<{ href: string; label: string; icon: LucideIcon }>;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-premium-dark p-6 text-white shadow-floating sm:p-8 lg:p-10">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark" />
        <div aria-hidden="true" className="absolute -left-20 -bottom-24 -z-10 h-72 w-96 rounded-full bg-brand-400/35 blur-[100px]" />
        <div aria-hidden="true" className="absolute -right-10 -top-16 -z-10 h-64 w-64 rounded-full bg-glow-warm/30 blur-[100px]" />

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-brand-on-dark backdrop-blur-sm">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-on-dark" />
              {formatDate(new Date().toISOString(), { dateStyle: 'full' })}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem]">
              {greeting}
              {firstName ? <span className="text-gradient-on-dark">, {firstName}</span> : null}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-300 sm:text-base">
              {t(
                'Everything on the public site is data you can edit here. Changes go live immediately.',
                'عوامی سائٹ پر موجود ہر چیز ایسا ڈیٹا ہے جس میں آپ یہاں ترمیم کر سکتے ہیں۔ تبدیلیاں فوراً لائیو ہو جاتی ہیں۔'
              )}
            </p>
          </div>

          {quickActions.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-3 lg:w-64 lg:shrink-0 lg:grid-cols-1">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={cn(
                      'group inline-flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-all hover:-translate-y-px',
                      index === 0
                        ? 'bg-white text-ink-900 shadow-lg shadow-black/20 hover:shadow-xl'
                        : 'border border-white/15 bg-white/[0.07] text-white backdrop-blur-md hover:border-white/25 hover:bg-white/[0.12]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        index === 0 ? 'bg-brand-solid text-white' : 'bg-white/10 text-brand-on-dark'
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="flex-1">{action.label}</span>
                    <ArrowUpRight className="h-4 w-4 opacity-50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 rtl:-scale-x-100" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {/* Needs attention */}
      <section aria-labelledby="attention-heading">
        <GroupHeading id="attention-heading">{t('Needs attention', 'توجہ درکار')}</GroupHeading>
        {attention.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attention.map((item) => {
              const Icon = item.icon;
              const inner = (
                <div className="flex items-center gap-3">
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset', toneChip[item.tone])}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl font-bold tabular-nums leading-none text-ink-900">{item.value}</p>
                    <p className="mt-1 truncate text-xs font-medium text-ink-600">{item.label}</p>
                  </div>
                  {item.href ? <ArrowUpRight className="h-4 w-4 text-ink-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-900" aria-hidden="true" /> : null}
                </div>
              );
              const box = cn(
                'group block rounded-2xl border bg-surface p-5 shadow-card transition-all',
                item.tone === 'warn' ? 'border-warn-200' : 'border-danger-200',
                item.href && 'hover:-translate-y-0.5 hover:shadow-lifted'
              );
              return (
                <li key={item.label}>
                  {item.href ? (
                    <Link href={item.href} className={box}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={box}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-4 rounded-2xl border border-brand-200/70 bg-brand-glow p-5 shadow-card">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/30">
              <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-2xl bg-brand-400/30 [animation-duration:2.5s] motion-reduce:hidden" />
              <CheckCircle2 className="relative h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-base font-bold text-ink-900">{t('All caught up', 'سب کچھ مکمل')}</p>
              <p className="text-xs text-ink-600">
                {t('No professionals waiting, no unanswered messages, no open reports or disputes.', 'کوئی پروفیشنل منتظر نہیں، کوئی پیغام بغیر جواب نہیں، کوئی شکایت یا تنازع کھلا نہیں۔')}
              </p>
            </div>
          </div>
        )}
      </section>

      <TileGroup id="marketplace-heading" title={t('Marketplace', 'مارکیٹ پلیس')} tiles={marketplaceTiles} tone="brand" />
      <TileGroup id="content-heading" title={t('Website content', 'ویب سائٹ کا مواد')} tiles={contentTiles} tone="accent" />

      {recent_activity.length > 0 ? (
        <section aria-labelledby="activity-heading">
          <GroupHeading id="activity-heading">{t('Recent changes', 'حالیہ تبدیلیاں')}</GroupHeading>
          <Card className="p-2 sm:p-3">
            <ol>
              {recent_activity.map((entry, index) => (
                <li key={index} className="relative flex gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-surface-muted">
                  {/* Timeline rail */}
                  {index < recent_activity.length - 1 ? (
                    <span aria-hidden="true" className="absolute left-[29px] top-12 bottom-[-12px] w-px bg-line" />
                  ) : null}
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white ring-4 ring-surface">
                    {entry.actor ? entry.actor.charAt(0).toUpperCase() : <UserRound className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-1">
                    <p className="text-sm">
                      <span className="font-medium text-ink-900">{entry.description ?? entry.action}</span>
                      {entry.actor ? <span className="text-ink-500"> {t('by', 'بذریعہ')} {entry.actor}</span> : null}
                    </p>
                    {entry.created_at ? (
                      <time dateTime={entry.created_at} className="shrink-0 text-xs tabular-nums text-ink-500">
                        {formatDate(entry.created_at, { dateStyle: 'medium', timeStyle: 'short' })}
                      </time>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      ) : null}

      <p className="text-sm text-ink-500">
        {t('Payments and analytics arrive with the operations dashboard in a later phase.', 'ادائیگیاں اور تجزیات بعد کے مرحلے میں آپریشنز ڈیش بورڈ کے ساتھ آئیں گے۔')}
      </p>
    </div>
  );
}

function GroupHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 flex items-center gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-600">
      <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-gradient-to-b from-brand-500 to-accent-500" />
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
    </h2>
  );
}

function TileGroup({ id, title, tiles, tone }: { id: string; title: string; tiles: Tile[]; tone: Tone }) {
  const t = useT();

  return (
    <section aria-labelledby={id}>
      <GroupHeading id={id}>{title}</GroupHeading>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const body = (
            <>
              <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100', tone === 'accent' ? 'bg-gradient-to-r from-accent-500 to-glow-warm' : 'bg-gradient-to-r from-brand-500 to-brand-300')} />
              <span aria-hidden="true" className={cn('absolute -right-10 -top-10 -z-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100', tone === 'accent' ? 'bg-accent-200/60' : 'bg-brand-200/60')} />
              <div className="flex items-start justify-between">
                <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-300 group-hover:scale-105', toneChip[tone])}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {tile.href ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-400 transition-all group-hover:border-brand-600 group-hover:bg-brand-solid group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
              <p className="mt-5 font-display text-4xl font-bold tracking-[-0.03em] tabular-nums text-ink-900">{tile.value}</p>
              <p className="mt-1 text-sm font-medium text-ink-700">{tile.label}</p>
              {tile.hint ? <p className="mt-0.5 text-xs text-ink-500">{tile.hint}</p> : null}
            </>
          );
          const box = 'group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition-all duration-300';

          return (
            <li key={tile.label}>
              {tile.href ? (
                <Link
                  href={tile.href}
                  aria-label={t(`Manage ${tile.label}`, `${tile.label} کا انتظام کریں`)}
                  className={cn(box, 'hover:-translate-y-1 hover:border-brand-200 hover:shadow-lifted')}
                >
                  {body}
                </Link>
              ) : (
                <div className={box}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
