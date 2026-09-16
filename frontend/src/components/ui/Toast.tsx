'use client';

import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Transient feedback. Toasts confirm that something happened; they never carry
 * information the user needs to keep, and they are never the only place an
 * error appears.
 *
 * The live region is polite for success and assertive for errors, so a screen
 * reader interrupts only when something actually went wrong.
 */

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = Date.now() + Math.random();

      setToasts((current) => [...current, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message: string) => toast(message, 'success'),
      error: (message: string) => toast(message, 'error'),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4',
          'sm:bottom-auto sm:right-0 sm:left-auto sm:top-0 sm:items-end'
        )}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.tone === 'error' ? 'alert' : 'status'}
            aria-live={item.tone === 'error' ? 'assertive' : 'polite'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-control)]',
              'border bg-surface p-3.5 shadow-[var(--shadow-lifted)]',
              item.tone === 'success' && 'border-safe-500/40',
              item.tone === 'error' && 'border-danger-500/40',
              item.tone === 'info' && 'border-[var(--border)]'
            )}
          >
            <ToastIcon tone={item.tone} />
            <p className="flex-1 text-sm text-foreground">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
              className="rounded p-0.5 text-ink-400 hover:text-ink-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastIcon({ tone }: { tone: ToastTone }) {
  const className = 'h-5 w-5 shrink-0';

  if (tone === 'success') {
    return <CircleCheck className={cn(className, 'text-safe-600')} aria-hidden="true" />;
  }

  if (tone === 'error') {
    return <CircleAlert className={cn(className, 'text-danger-600')} aria-hidden="true" />;
  }

  return <Info className={cn(className, 'text-info-500')} aria-hidden="true" />;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }

  return context;
}
