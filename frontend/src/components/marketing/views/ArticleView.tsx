'use client';

import { ArrowRight, CalendarDays, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { formatDate, PostGrid, RichText } from '@/components/marketing/Cards';
import { Breadcrumbs, Section } from '@/components/marketing/PageHeader';
import { PageLoadError, PageSkeleton } from '@/components/marketing/PageStates';
import { usePublicData, useResolvedSlug } from '@/hooks/usePublicData';
import { blogApi } from '@/lib/api/endpoints';
import type { BlogPostPayload } from '@/lib/api/types';

export function ArticleView({ slug: builtSlug, initial }: { slug: string | null; initial: BlogPostPayload | null }) {
  const slug = useResolvedSlug(builtSlug, 1);
  const query = usePublicData(['article', slug], () => blogApi.post(slug as string), initial, Boolean(slug));

  if (!query.data) {
    return query.isError ? (
      <PageLoadError
        error={query.error}
        onRetry={() => query.refetch()}
        notFoundTitle="That guide is not available"
        notFoundDescription="It may have been unpublished. Browse the other home maintenance guides instead."
      />
    ) : (
      <PageSkeleton />
    );
  }

  const { post, related_posts } = query.data;

  return (
    <>
      <article>
        <header className="border-b border-[var(--border)] bg-gradient-to-b from-brand-wash to-background">
          <Container size="narrow" className="py-10 sm:py-14">
            <Breadcrumbs
              items={[
                { name: 'Home', href: '/' },
                { name: 'Guides', href: '/blog' },
                ...(post.category ? [{ name: post.category.name, href: `/blog/category/${post.category.slug}` }] : []),
                { name: post.title },
              ]}
              className="mb-5"
            />

            {post.category ? (
              <Link href={`/blog/category/${post.category.slug}`}>
                <Badge tone="brand">{post.category.name}</Badge>
              </Link>
            ) : null}

            <h1 className="mt-4 text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            {post.excerpt ? <p className="mt-4 text-pretty text-lg text-ink-600">{post.excerpt}</p> : null}

            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
              {post.author ? <span>By {post.author.name}</span> : null}
              {post.published_at ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </span>
              ) : null}
              {post.reading_minutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {post.reading_minutes} min read
                </span>
              ) : null}
            </p>
          </Container>
        </header>

        <Container size="narrow" className="py-10 sm:py-14">
          {post.featured_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featured_image_url}
              alt={post.featured_image_alt ?? ''}
              className="mb-8 w-full rounded-[var(--radius-card)] object-cover"
            />
          ) : null}

          <RichText html={post.body_html} />

          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-6">
              <Tag className="h-4 w-4 text-ink-400" aria-hidden="true" />
              {post.tags.map((tag) => (
                <Badge key={tag.slug} tone="neutral">
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : null}

          {post.cta || post.service_category ? (
            <Card className="mt-10 bg-brand-950 text-white">
              <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <h2 className="text-lg font-bold">
                    {post.service_category ? `Need help with ${post.service_category.name.toLowerCase()}?` : 'Need a professional?'}
                  </h2>
                  <p className="mt-1 text-sm text-brand-100">
                    Verified professionals, prices agreed before work starts.
                  </p>
                </div>
                <ButtonLink
                  href={post.cta?.url ?? (post.service_category ? `/services/${post.service_category.slug}` : '/find-a-technician')}
                  variant="accent"
                >
                  {post.cta?.label ?? 'Find a professional'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </CardBody>
            </Card>
          ) : null}
        </Container>
      </article>

      {related_posts.length > 0 ? (
        <Section title="Read next" muted>
          <PostGrid posts={related_posts} />
        </Section>
      ) : null}
    </>
  );
}
