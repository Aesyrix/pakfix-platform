import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

/**
 * Page gutter. 16px on a phone, widening with the viewport, so nothing ever
 * touches the edge of a small screen.
 */
export function Container({
  className,
  size = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: 'narrow' | 'default' | 'wide' }) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        size === 'narrow' && 'max-w-3xl',
        size === 'default' && 'max-w-6xl',
        size === 'wide' && 'max-w-7xl',
        className
      )}
      {...props}
    />
  );
}
