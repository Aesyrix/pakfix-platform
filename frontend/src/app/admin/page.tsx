'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText, Inbox, MapPin, Newspaper, Users, Wrench } from 'lucide-react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { useT } from '@/components/i18n/LocaleProvider';
import { Card, CardBody } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { adminApi } from '@/lib/api/endpoints';

/** What exists, what needs attention, and who changed what. All live data. */
export default function AdminOverviewPage() {
  const t = useT();
  const query = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.overview, staleTime: 30_000 });

  if (query.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={t('Loading', 'لوڈ ہو رہا ہے')}>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState description={t('The overview could not be loaded.', 'جائزہ لوڈ نہیں ہو سکا۔')} onRetry={() => query.refetch()} />;
  }

  const { content, marketplace, inbox, recent_activity, permissions } = query.data;

  const tiles = [
    { label: t('Published guides', 'شائع شدہ گائیڈز'), value: content.published_posts, hint: t(`${content.draft_posts} drafts`, `${content.draft_posts} ڈرافٹ`), icon: Newspaper, href: permissions.blog ? '/admin/blog' : null },
    { label: t('Pages', 'صفحات'), value: content.pages, icon: FileText, href: permissions.content ? '/admin/pages' : null },
    { label: t('FAQs', 'عام سوالات'), value: content.faqs, icon: FileText, href: permissions.content ? '/admin/faqs' : null },
    { label: t('Active services', 'فعال خدمات'), value: content.active_categories, icon: Wrench, href: permissions.services ? '/admin/services' : null },
    { label: t('Local SEO pages', 'مقامی SEO صفحات'), value: content.local_pages, hint: t('service and city pairs with professionals', 'سروس اور شہر کے جوڑے پروفیشنلز کے ساتھ'), icon: MapPin, href: null },
    { label: t('Verified professionals', 'تصدیق شدہ پروفیشنلز'), value: marketplace.verified_professionals, hint: t(`${marketplace.pending_professionals} awaiting review`, `${marketplace.pending_professionals} زیرِ جائزہ`), icon: Users, href: null },
    { label: t('Customers', 'گاہک'), value: marketplace.customers, icon: Users, href: null },
    { label: t('Unanswered messages', 'غیر جوابدہ پیغامات'), value: inbox.unhandled_contact_messages, icon: Inbox, href: permissions.inbox ? '/admin/inbox' : null },
  ];

  return (
    <>
      <AdminPageHeader
        title={t('Overview', 'جائزہ')}
        description={t('Everything on the public site is data you can edit here. Changes go live immediately.', 'عوامی سائٹ پر موجود ہر چیز ایسا ڈیٹا ہے جس میں آپ یہاں ترمیم کر سکتے ہیں۔ تبدیلیاں فوراً لائیو ہو جاتی ہیں۔')}
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;

          const body = (
            <CardBody className="flex h-full flex-col gap-1">
              <span className="flex items-center gap-2 text-sm text-ink-500">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tile.label}
              </span>
              <span className="text-2xl font-bold">{tile.value}</span>
              {tile.hint ? <span className="text-xs text-ink-500">{tile.hint}</span> : null}
              {tile.href ? (
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-[#00824A]">
                  {t('Manage', 'منتظم کریں')}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              ) : null}
            </CardBody>
          );

          return (
            <li key={tile.label}>
              {tile.href ? (
                <Card interactive className="relative h-full">
                  <Link href={tile.href} className="absolute inset-0" aria-label={t(`Manage ${tile.label}`, `${tile.label} کا انتظام کریں`)} />
                  {body}
                </Card>
              ) : (
                <Card className="h-full">{body}</Card>
              )}
            </li>
          );
        })}
      </ul>

      {recent_activity.length > 0 ? (
        <section aria-labelledby="activity-heading" className="mt-8">
          <h2 id="activity-heading" className="text-lg font-semibold tracking-tight">
            {t('Recent changes', 'حالیہ تبدیلیاں')}
          </h2>
          <Card className="mt-3">
            <ul className="divide-y divide-[var(--border)]">
              {recent_activity.map((entry, index) => (
                <li key={index} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <span>
                    <span className="font-medium">{entry.description ?? entry.action}</span>
                    {entry.actor ? <span className="text-ink-500"> {t('by', 'بذریعہ')} {entry.actor}</span> : null}
                  </span>
                  {entry.created_at ? (
                    <time dateTime={entry.created_at} className="text-xs text-ink-500">
                      {new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.created_at))}
                    </time>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}

      <p className="mt-8 text-sm text-ink-500">
        {t('Bookings, payments, disputes and analytics arrive with the operations dashboard in a later phase.', 'بکنگ، ادائیگیاں، تنازعات اور تجزیات بعد کے مرحلے میں آپریشنز ڈیش بورڈ کے ساتھ آئیں گے۔')}
      </p>
    </>
  );
}
