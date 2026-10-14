'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  dirFor,
  htmlLang,
  isLocale,
  localeLabel,
  type Locale,
} from '@/lib/i18n';
import { formatDuration } from '@/lib/utils/money';

/*
 * The locale lives outside React so the first client render can match the
 * server-rendered English markup and then, without a hydration mismatch,
 * switch to the Urdu the user last chose.
 *
 * The no-flash script in the root layout has already put that choice on the
 * <html> element before the first paint; this store reads it from there.
 */

const listeners = new Set<() => void>();

/** `null` until the client reads the stored choice. */
let current: Locale | null = null;

function readStoredLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  try {
    const fromHtml = document.documentElement.dataset.locale;
    if (isLocale(fromHtml)) return fromHtml;

    const match = document.cookie.match(
      new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`)
    );
    if (match) {
      const fromCookie = decodeURIComponent(match[1]);
      if (isLocale(fromCookie)) return fromCookie;
    }

    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Private mode, blocked storage -- fall back to the built-in default.
  }
  return DEFAULT_LOCALE;
}

function getSnapshot(): Locale {
  if (current === null) current = readStoredLocale();
  return current;
}

/** During hydration React uses this, so the markup matches the build. */
function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyToDocument(locale: Locale): void {
  const root = document.documentElement;
  root.lang = htmlLang(locale);
  root.dir = dirFor(locale);
  root.dataset.locale = locale;
}

function setLocale(next: Locale): void {
  if (current === next) return;
  current = next;
  try {
    applyToDocument(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
  } catch {
    // Storage unavailable; the switch still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

interface LocaleContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export function useLocale(): LocaleContextValue {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback((next: Locale) => setLocale(next), []);
  const toggle = useCallback(
    () => setLocale(getSnapshot() === 'ur' ? 'en' : 'ur'),
    []
  );

  return useMemo(
    () => ({ locale, dir: dirFor(locale), setLocale: set, toggleLocale: toggle }),
    [locale, set, toggle]
  );
}

/** Layout effect on the client, no server warning during the static build. */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Releases the first-paint hold the inline script applies when the saved
 * language is Urdu (see `localeInitScript`). It stays out of the way for
 * English, and for Urdu it waits until the client render actually carries the
 * stored locale, so the English text compiled into the static HTML is never
 * shown to an Urdu reader on refresh. Rendered once, near the root.
 */
export function LocaleReady(): null {
  const { locale } = useLocale();

  useIsomorphicLayoutEffect(() => {
    if (locale === getSnapshot()) {
      document.documentElement.classList.remove('i18n-pending');
    }
  }, [locale]);

  return null;
}

/**
 * The translator. Each component keeps its strings beside the JSX:
 *   const t = useT();
 *   <h1>{t('Show the Problem.', 'مسئلہ دکھائیں۔')}</h1>
 *
 * English is required, Urdu is optional -- an untranslated string renders in
 * English rather than breaking.
 */
export function useT(): (english: string, urdu?: string) => string {
  const { locale } = useLocale();
  return useCallback(
    (english: string, urdu?: string) =>
      locale === 'ur' && urdu !== undefined ? urdu : english,
    [locale]
  );
}

/**
 * Locale-aware dates. Urdu gets Urdu month names ("12 اکتوبر 2026") while the
 * digits stay Latin, which is how Pakistani readers write numbers.
 */
export function useFormatDate(): (
  iso: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
) => string {
  const { locale } = useLocale();
  return useCallback(
    (iso, options) => {
      if (!iso) return '';
      const tag = locale === 'ur' ? 'ur-PK-u-nu-latn' : 'en-PK';
      return new Intl.DateTimeFormat(
        tag,
        options ?? { day: 'numeric', month: 'long', year: 'numeric' }
      ).format(new Date(iso));
    },
    [locale]
  );
}

/**
 * Locale-aware durations: "45 minutes" becomes "45 منٹ". The English branch
 * shares the single implementation in `@/lib/utils/money`.
 */
export function useFormatDuration(): (minutes: number | null | undefined) => string {
  const { locale } = useLocale();
  return useCallback(
    (minutes) => {
      if (!minutes) return '—';
      if (locale !== 'ur') return formatDuration(minutes);

      if (minutes < 60) return `${minutes} منٹ`;

      const hours = Math.floor(minutes / 60);
      const remainder = minutes % 60;
      const hourLabel = `${hours} ${hours === 1 ? 'گھنٹہ' : 'گھنٹے'}`;

      return remainder === 0 ? hourLabel : `${hourLabel} ${remainder} منٹ`;
    },
    [locale]
  );
}

export { localeLabel };
