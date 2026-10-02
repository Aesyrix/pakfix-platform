import { BadgeCheck, CalendarDays, Clock, MapPin, Siren, Star } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { BlogPostCard, PublicReview, QuestionAnswer, TechnicianCard } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Ratings
// ---------------------------------------------------------------------------

export function StarRating({ value, className, size = 'sm' }: { value: number; className?: string; size?: 'sm' | 'md' }) {
  const rounded = Math.round(value);
  const icon = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(icon, index < rounded ? 'fill-accent-400 text-accent-400' : 'text-ink-300')}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Professionals
// ---------------------------------------------------------------------------

export function Initials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white',
        className
      )}
    >
      {initials || 'P'}
    </span>
  );
}

export function ProfessionalCard({ professional }: { professional: TechnicianCard }) {
  return (
    <Card interactive className="h-full">
      <CardBody className="flex h-full flex-col gap-3">
        <div className="flex items-start gap-3">
          {professional.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={professional.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <Initials name={professional.name} className="h-12 w-12 text-sm" />
          )}

          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 text-base font-semibold leading-snug">
              <Link href={`/professionals/${professional.slug}`} className="after:absolute after:inset-0 hover:text-brand-700">
                {professional.name}
              </Link>
              {professional.is_verified ? (
                <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" aria-label="Verified professional" />
              ) : null}
            </h3>
            {professional.city ? (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {professional.city.name}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <StarRating value={professional.rating_average} />
            <span className="font-semibold">{professional.rating_average.toFixed(1)}</span>
            <span className="text-ink-500">({professional.rating_count})</span>
          </span>
          <span className="text-ink-500">{professional.completed_jobs_count} jobs</span>
        </div>

        <p className="line-clamp-2 flex-1 text-sm text-ink-600">{professional.headline}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{professional.years_experience} yrs experience</Badge>
          {professional.offers_emergency_service ? (
            <Badge tone="danger">
              <Siren className="h-3 w-3" aria-hidden="true" />
              Emergencies
            </Badge>
          ) : null}
          {professional.visit_fee ? <Badge tone="accent">Visit {professional.visit_fee.display}</Badge> : null}
        </div>
      </CardBody>
    </Card>
  );
}

/** A grid of professionals with a relative-positioned card so the whole card is clickable. */
export function ProfessionalGrid({
  professionals,
  emptyTitle = 'No professionals here yet',
  emptyDescription = 'We are onboarding verified professionals. Check back soon, or ask the assistant which service you need.',
}: {
  professionals: TechnicianCard[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (professionals.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {professionals.map((professional) => (
        <li key={professional.id} className="relative">
          <ProfessionalCard professional={professional} />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export function formatDate(iso: string | null): string {
  if (!iso) return '';

  return new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export function PostCard({ post }: { post: BlogPostCard }) {
  return (
    <Card interactive className="relative h-full overflow-hidden">
      {post.featured_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.featured_image_url} alt={post.featured_image_alt ?? ''} className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="flex aspect-[16/9] w-full items-end bg-gradient-to-br from-brand-600 to-brand-900 p-4" aria-hidden="true">
          <span className="text-sm font-semibold text-brand-50">{post.category?.name ?? 'Guide'}</span>
        </div>
      )}
      <CardBody className="flex flex-col gap-2">
        {post.category ? <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">{post.category.name}</span> : null}
        <h3 className="text-base font-semibold leading-snug">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 hover:text-brand-700">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="line-clamp-3 text-sm text-ink-600">{post.excerpt}</p> : null}
        <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
          {post.published_at ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(post.published_at)}
            </span>
          ) : null}
          {post.reading_minutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.reading_minutes} min read
            </span>
          ) : null}
        </p>
      </CardBody>
    </Card>
  );
}

export function PostGrid({ posts }: { posts: BlogPostCard[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Reviews and FAQs
// ---------------------------------------------------------------------------

export function ReviewList({ reviews }: { reviews: PublicReview[] }) {
  if (reviews.length === 0) {
    return <EmptyState title="No reviews yet" description="Reviews appear here after customers complete a job." />;
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {reviews.map((review) => (
        <li key={review.id}>
          <Card className="h-full">
            <CardBody className="flex h-full flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <StarRating value={review.rating} />
                {review.is_verified ? <Badge tone="safe">Verified booking</Badge> : null}
              </div>
              {review.comment ? <p className="flex-1 text-sm leading-relaxed text-ink-700">{review.comment}</p> : null}
              <p className="text-xs text-ink-500">
                {review.author}
                {review.created_at ? ` · ${formatDate(review.created_at)}` : ''}
              </p>
              {review.response ? (
                <p className="rounded-[var(--radius-control)] bg-surface-muted p-3 text-sm text-ink-600">
                  <span className="font-semibold">Reply: </span>
                  {review.response}
                </p>
              ) : null}
            </CardBody>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function FaqList({ faqs }: { faqs: QuestionAnswer[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {faqs.map((faq) => (
        <details key={faq.question} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
            {faq.question}
            <span className="shrink-0 text-xl leading-none text-ink-400 transition-transform group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Server-rendered Markdown output. The API strips raw HTML before it gets here. */
export function RichText({ html, className }: { html: string; className?: string }) {
  return <div className={cn('rich-text', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function LinkPills({ links, label }: { links: Array<{ name: string; path: string }>; label: string }): ReactNode {
  if (links.length === 0) return null;

  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              href={link.path}
              className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--border)] bg-surface px-4 text-sm font-medium hover:border-brand-400 hover:text-brand-700"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
