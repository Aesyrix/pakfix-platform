'use client';

import { SearchX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';
import { useT } from '@/components/i18n/LocaleProvider';
import { ApiError } from '@/lib/api/client';

/** Placeholder for a public page whose content is still loading. */
export function PageSkeleton() {
  const t = useT();
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{t('Loading', 'لوڈ ہو رہا ہے')}</span>
      <div className="border-b border-[var(--border)] bg-gradient-to-b from-brand-wash to-background">
        <Container className="py-10 sm:py-14">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-5 h-10 w-3/4 max-w-xl" />
          <SkeletonText lines={2} className="mt-4 max-w-2xl" />
        </Container>
      </div>
      <Container className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </Container>
    </div>
  );
}

/**
 * What a public page shows when its data could not be loaded: a real 404 for
 * content that does not exist, a retry for everything else.
 */
export function PageLoadError({
  error,
  onRetry,
  notFoundTitle,
  notFoundDescription,
}: {
  error: unknown;
  onRetry: () => void;
  notFoundTitle?: string;
  notFoundDescription?: string;
}) {
  const t = useT();
  const title = notFoundTitle ?? t('We could not find that page', 'ہمیں وہ صفحہ نہیں مل سکا');
  const description = notFoundDescription ?? t('It may have moved, or it is no longer available.', 'یہ منتقل ہو گیا ہو، یا اب دستیاب نہیں ہے۔');

  if (error instanceof ApiError && error.isNotFound) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<SearchX className="h-5 w-5" />}
          title={title}
          description={description}
          action={<ButtonLink href="/services">{t('Browse services', 'خدمات دیکھیں')}</ButtonLink>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <ErrorState
        description={error instanceof ApiError ? error.message : t('Something went wrong. Try again in a moment.', 'کچھ غلط ہو گیا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔')}
        onRetry={onRetry}
      />
    </Container>
  );
}
