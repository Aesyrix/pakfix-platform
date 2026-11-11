'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * A thin bar along the top of the window while the next page loads.
 *
 * Moving between pages fetches that page's data first, which on a slow
 * connection can take most of a second. Without a sign of progress the click
 * looks ignored. The bar starts when an internal link is clicked, creeps
 * forward while waiting, and completes when the new page is in place. It only
 * appears if the wait is long enough to notice, so instant moves never flash.
 */
const SHOW_AFTER_MS = 120;
const GIVE_UP_MS = 12_000;

export function NavigationProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle');
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  // A new page is in place: finish the bar, then hide it.
  useEffect(() => {
    if (!started.current) return;
    started.current = false;
    clearTimers();
    // Deferred so the bar never updates during the render that moved pages.
    timers.current.push(window.setTimeout(() => setPhase((p) => (p === 'loading' ? 'done' : 'idle')), 0));
    timers.current.push(window.setTimeout(() => setPhase('idle'), 350));
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a');
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;

      let url: URL;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same page (or only a #section on it): nothing to load.
      if (url.pathname === window.location.pathname) return;

      started.current = true;
      clearTimers();
      timers.current.push(window.setTimeout(() => started.current && setPhase('loading'), SHOW_AFTER_MS));
      timers.current.push(
        window.setTimeout(() => {
          started.current = false;
          setPhase('idle');
        }, GIVE_UP_MS)
      );
    }

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clearTimers();
    };
  }, []);

  if (phase === 'idle') return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      aria-busy={phase === 'loading'}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
    >
      <div
        className="h-full bg-brand-600 shadow-[0_0_8px_var(--color-brand-400)]"
        style={{
          width: phase === 'done' ? '100%' : '85%',
          opacity: phase === 'done' ? 0 : 1,
          transition:
            phase === 'done'
              ? 'width 150ms ease-out, opacity 250ms ease 100ms'
              : 'width 1600ms cubic-bezier(0.1, 0.7, 0.2, 1)',
          // Start from a sliver so the bar visibly grows.
          animation: phase === 'loading' ? 'pf-progress-start 1600ms cubic-bezier(0.1, 0.7, 0.2, 1)' : undefined,
        }}
      />
    </div>
  );
}
