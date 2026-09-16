'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils/cn';

/**
 * What a screen shows when a request failed. Always offers a retry, because
 * most failures here are a flaky mobile connection rather than a real fault.
 */
export function ErrorState({
  title = 'That did not load',
  description = 'Something went wrong on our side. Try again in a moment.',
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)]',
        'border border-[var(--border)] bg-surface px-6 py-12 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-500/12 text-danger-600">
        <TriangleAlert className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-ink-500">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
