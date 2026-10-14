'use client';

import { PageHeader } from '@/components/marketing/PageHeader';
import { BlogIndexView } from '@/components/marketing/views/BlogIndexView';
import { useT } from '@/components/i18n/LocaleProvider';
import type { BlogCategory, BlogPostCard } from '@/lib/api/types';

export function BlogListContent({
  categories,
  initialPosts,
  categorySlug,
  title,
  titleUr,
  subtitle,
  subtitleUr,
  trailingCrumb,
}: {
  categories: BlogCategory[];
  initialPosts: BlogPostCard[];
  categorySlug?: string;
  title: string;
  titleUr?: string;
  subtitle?: string;
  subtitleUr?: string;
  trailingCrumb?: string;
}) {
  const t = useT();
  const breadcrumbs = [
    { name: t('Home', 'ہوم'), href: '/' },
    { name: t('Guides', 'رہنمائی'), href: '/blog' },
    ...(trailingCrumb ? [{ name: trailingCrumb }] : []),
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={t(title, titleUr)}
        subtitle={subtitle ? t(subtitle, subtitleUr) : undefined}
      />

      <BlogIndexView categories={categories} categorySlug={categorySlug} initialPosts={initialPosts} />
    </>
  );
}
