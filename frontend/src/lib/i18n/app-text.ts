'use client';

import { useCallback } from 'react';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { APP_STRINGS_EN, APP_STRINGS_UR, type AppStringKey } from './app-strings';

export type { AppStringKey };

import { formatAppText, type Params } from './app-format';

/** The app's own text for `key`, in the language picked on the website. */
export function useAppText(): (key: AppStringKey, params?: Params) => string {
  const { locale } = useLocale();
  return useCallback(
    (key: AppStringKey, params?: Params) =>
      formatAppText(locale === 'ur' ? APP_STRINGS_UR[key] : APP_STRINGS_EN[key], params),
    [locale]
  );
}
