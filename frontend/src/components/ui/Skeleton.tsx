import { cn } from '@/lib/utils/cn';

/**
 * A loading placeholder. Screens use these rather than a spinner so the
 * layout does not jump when content arrives.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

/** Skeleton shaped like a line of text. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--border)] bg-surface p-5',
        className
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-10 w-10 rounded-[var(--radius-control)]" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <SkeletonText lines={2} className="mt-3" />
    </div>
  );
}
