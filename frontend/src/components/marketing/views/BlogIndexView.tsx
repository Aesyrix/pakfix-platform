'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Newspaper } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { PostCard } from '@/components/marketing/Cards';
import { useT } from '@/components/i18n/LocaleProvider';
import { blogApi } from '@/lib/api/endpoints';
import type { BlogCategory, BlogPostCard } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

/**
 * The article list, with "show more" rather than numbered pages: on a phone
 * that is one thumb tap instead of a pagination row.
 */
export function BlogIndexView({
  categories,
  categorySlug = null,
  initialPosts,
}: {
  categories: BlogCategory[];
  categorySlug?: string | null;
  initialPosts: BlogPostCard[];
}) {
  const t = useT();
  const query = useInfiniteQuery({
    queryKey: ['blog', categorySlug],
    queryFn: ({ pageParam }) => blogApi.posts({ category: categorySlug ?? undefined, page: pageParam, per_page: 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination?.has_more ? last.pagination.current_page + 1 : undefined),
    staleTime: 60_000,
  });

  const posts = query.data?.pages.flatMap((page) => page.data) ?? initialPosts;

  return (
    <Container className="py-10 sm:py-14">
      {categories.length > 0 ? (
        <nav aria-label={t('Article categories', 'مضامین کے زمرے')} className="mb-10">
          {/* One soft panel; scrolls sideways on phones, wraps on larger screens */}
          <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:rounded-2xl sm:border sm:border-line/70 sm:bg-surface-muted/70 sm:p-1.5 sm:pb-1.5 [&::-webkit-scrollbar]:hidden">
            <li className="shrink-0">
              <CategoryPill href="/blog" active={!categorySlug}>
                {t('All guides', 'تمام گائیڈز')}
              </CategoryPill>
            </li>
            {categories.map((category) => (
              <li key={category.slug} className="shrink-0">
                <CategoryPill
                  href={`/blog/category/${category.slug}`}
                  active={categorySlug === category.slug}
                  count={category.post_count}
                >
                  {category.name}
                </CategoryPill>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {query.isPending && posts.length === 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={t('Loading articles', 'مضامین لوڈ ہو رہے ہیں')}>
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index}>
              <SkeletonCard />
            </li>
          ))}
        </ul>
      ) : query.isError && posts.length === 0 ? (
        <ErrorState description={t('The guides could not be loaded.', 'گائیڈز لوڈ نہیں ہو سکیں۔')} onRetry={() => query.refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-5 w-5" />}
          title={t('No guides here yet', 'ابھی یہاں کوئی گائیڈ نہیں')}
          description={t('We are writing them. In the meantime, describe your problem and PakFix will point you to the right service.', 'ہم انہیں لکھ رہے ہیں۔ اس دوران اپنا مسئلہ بیان کریں اور پاک فکس آپ کو صحیح سروس کی طرف رہنمائی کرے گا۔')}
        />
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>

          {query.hasNextPage ? (
            <div className="mt-10 flex justify-center">
              <Button variant="secondary" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
                {t('Show more guides', 'مزید گائیڈز دکھائیں')}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Container>
  );
}

function CategoryPill({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  // Categories without guides yet stay clickable, just quieter.
  const empty = count === 0 && !active;

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] border ps-4 text-sm font-medium transition-all duration-200',
        count === undefined ? 'pe-4' : 'pe-1.5',
        active
          ? 'border-transparent bg-brand-solid text-white shadow-md shadow-brand-500/25'
          : empty
          ? 'border-line/70 bg-surface text-ink-400 hover:border-line hover:text-ink-600'
          : 'border-line/70 bg-surface text-ink-700 shadow-xs hover:-translate-y-px hover:border-brand-300 hover:text-brand-700 hover:shadow-sm'
      )}
    >
      {children}
      {count !== undefined ? (
        <span
          className={cn(
            'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
            active ? 'bg-white/20 text-white' : empty ? 'bg-surface-muted text-ink-400' : 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
