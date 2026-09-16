'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Everything the client tree needs: the query cache, toasts, and the one-time
 * session restore.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Retrying a 401 or a 422 just repeats the same answer.
              if (error instanceof ApiError && !error.isTransient) return false;
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SessionRestorer />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}

/**
 * Turns a stored token back into a signed-in user, once per page load.
 * Renders nothing; guards read `initialising` from the store.
 */
function SessionRestorer() {
  const restore = useAuthStore((state) => state.restore);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    void restore();
  }, [restore]);

  return null;
}
