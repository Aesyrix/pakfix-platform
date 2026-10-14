'use client';

import { useT } from '@/components/i18n/LocaleProvider';

/** The bilingual heading block on an authentication card. */
export function AuthIntro({
  title,
  titleUr,
  description,
  descriptionUr,
}: {
  title: string;
  titleUr?: string;
  description?: string;
  descriptionUr?: string;
}) {
  const t = useT();

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{t(title, titleUr)}</h1>
      {description ? (
        <p className="mt-2 text-sm text-ink-600">{t(description, descriptionUr)}</p>
      ) : null}
    </>
  );
}
