'use client';

import { SearchX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';
import { ApiError } from '@/lib/api/client';

/** Placeholder for a public page whose content is still loading. */
export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
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
  notFoundTitle = 'We could not find that page',
  notFoundDescription = 'It may have moved, or it is no longer available.',
}: {
  error: unknown;
  onRetry: () => void;
  notFoundTitle?: string;
  notFoundDescription?: string;
}) {
  if (error instanceof ApiError && error.isNotFound) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<SearchX className="h-5 w-5" />}
          title={notFoundTitle}
          description={notFoundDescription}
          action={<ButtonLink href="/services">Browse services</ButtonLink>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <ErrorState
        description={error instanceof ApiError ? error.message : 'Something went wrong. Try again in a moment.'}
        onRetry={onRetry}
      />
    </Container>
  );
}
