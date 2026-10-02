import type { Metadata } from 'next';

/**
 * SEO helpers shared by every public page, so canonical URLs, OpenGraph and
 * Twitter cards are built the same way everywhere.
 */

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pakfix.pk').replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * The segment used for "shell" pages: pre-built pages the PHP server fills in
 * at request time for content created after the last build. They are never
 * indexed under their placeholder metadata; Laravel strips the noindex when it
 * writes in the real title and description.
 */
export const SHELL = '_';

export function isShell(value: string | undefined | null): boolean {
  return value === SHELL;
}

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  type = 'website',
}: {
  title: string;
  description?: string | null;
  path: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(path);
  const text = description ?? undefined;

  return {
    title: { absolute: title.includes('PakFix') ? title : `${title} | PakFix` },
    description: text,
    alternates: { canonical: url },
    openGraph: { title, description: text, url, type, siteName: 'PakFix', locale: 'en_PK' },
    twitter: { card: 'summary_large_image', title, description: text },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function shellMetadata(): Metadata {
  return {
    title: { absolute: 'PakFix' },
    description: 'PakFix',
    robots: { index: false, follow: true },
  };
}
