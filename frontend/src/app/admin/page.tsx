'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText, Inbox, MapPin, Newspaper, Users, Wrench } from 'lucide-react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { Card, CardBody } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { adminApi } from '@/lib/api/endpoints';

/** What exists, what needs attention, and who changed what. All live data. */
export default function AdminOverviewPage() {
  const query = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.overview, staleTime: 30_000 });

  if (query.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState description="The overview could not be loaded." onRetry={() => query.refetch()} />;
  }

  const { content, marketplace, inbox, recent_activity, permissions } = query.data;

  const tiles = [
    { label: 'Published guides', value: content.published_posts, hint: `${content.draft_posts} drafts`, icon: Newspaper, href: permissions.blog ? '/admin/blog' : null },
    { label: 'Pages', value: content.pages, icon: FileText, href: permissions.content ? '/admin/pages' : null },
    { label: 'FAQs', value: content.faqs, icon: FileText, href: permissions.content ? '/admin/faqs' : null },
    { label: 'Active services', value: content.active_categories, icon: Wrench, href: permissions.services ? '/admin/services' : null },
    { label: 'Local SEO pages', value: content.local_pages, hint: 'service and city pairs with professionals', icon: MapPin, href: null },
    { label: 'Verified professionals', value: marketplace.verified_professionals, hint: `${marketplace.pending_professionals} awaiting review`, icon: Users, href: null },
    { label: 'Customers', value: marketplace.customers, icon: Users, href: null },
    { label: 'Unanswered messages', value: inbox.unhandled_contact_messages, icon: Inbox, href: permissions.inbox ? '/admin/inbox' : null },
  ];

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Everything on the public site is data you can edit here. Changes go live immediately."
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
                  Manage
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              ) : null}
            </CardBody>
          );

          return (
            <li key={tile.label}>
              {tile.href ? (
                <Card interactive className="relative h-full">
                  <Link href={tile.href} className="absolute inset-0" aria-label={`Manage ${tile.label}`} />
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
            Recent changes
          </h2>
          <Card className="mt-3">
            <ul className="divide-y divide-[var(--border)]">
              {recent_activity.map((entry, index) => (
                <li key={index} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <span>
                    <span className="font-medium">{entry.description ?? entry.action}</span>
                    {entry.actor ? <span className="text-ink-500"> by {entry.actor}</span> : null}
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
        Bookings, payments, disputes and analytics arrive with the operations dashboard in a later phase.
      </p>
    </>
  );
}
