/**
 * Language support for the public website.
 *
 * The site is compiled to static HTML and served by PHP, so there is no
 * server to read a locale from the URL. The switch is therefore client-side:
 * the choice lives in a cookie and in localStorage, and the provider moves
 * the document between LTR English and RTL Urdu. English is what gets built
 * into the HTML; every translated string carries its Urdu twin next to it in
 * the component that renders it.
 */
export const LOCALES = ['en', 'ur'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** localStorage key, and the cookie the no-flash script reads before paint. */
export const LOCALE_STORAGE_KEY = 'pakfix.locale';
export const LOCALE_COOKIE = 'pakfix_locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ur';
}

/** Urdu is written right to left; English is not. */
export function dirFor(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ur' ? 'rtl' : 'ltr';
}

export function htmlLang(locale: Locale): string {
  return locale === 'ur' ? 'ur' : 'en';
}

export function localeLabel(locale: Locale): string {
  return locale === 'ur' ? 'اردو' : 'English';
}

/** The inline script that applies the stored locale before the first paint. */
export function localeInitScript(): string {
  return (
    '(function(){try{' +
    `var m=document.cookie.match(/(?:^|; )${LOCALE_COOKIE}=([^;]+)/);` +
    `var l=m?decodeURIComponent(m[1]):localStorage.getItem('${LOCALE_STORAGE_KEY}');` +
    "if(l!=='ur'){l='en';}" +
    "var e=document.documentElement;e.lang=l;e.dir=l==='ur'?'rtl':'ltr';e.dataset.locale=l;" +
    // Urdu is not what the static HTML contains, so hold the first paint until
    // the client swaps the strings in. The timeout is a safety net in case the
    // app never mounts; LocaleReady clears it as soon as Urdu has rendered.
    "if(l==='ur'){e.classList.add('i18n-pending');" +
    "setTimeout(function(){e.classList.remove('i18n-pending');},1500);}" +
    '}catch(_){}})();'
  );
}
