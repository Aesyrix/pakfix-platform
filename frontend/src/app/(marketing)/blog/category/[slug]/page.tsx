import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { breadcrumbSchema, JsonLd } from '@/components/marketing/JsonLd';
import { blogApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { BlogListContent } from '../../BlogListContent';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await safeFetch(() => blogApi.categories(), [], 'blog category slugs');

  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const categories = await safeFetch(() => blogApi.categories(), [], 'blog categories');
  const category = categories.find((entry) => entry.slug === slug);

  return pageMetadata({
    title: category ? `${category.name} Guides` : 'Guides',
    description: category?.description ?? `PakFix home maintenance guides about ${category?.name ?? 'home repair'}.`,
    path: `/blog/category/${slug}`,
  });
}

export default async function BlogCategoryPage({ params }: Params) {
  const { slug } = await params;

  const [categories, posts] = await Promise.all([
    safeFetch(() => blogApi.categories(), [], 'blog categories'),
    safeFetch(() => blogApi.posts({ category: slug, per_page: 12 }).then((r) => r.data), [], `blog category ${slug}`),
  ]);

  const category = categories.find((entry) => entry.slug === slug);

  // The build only generates categories that exist, so this is a safety net.
  if (categories.length > 0 && !category) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Guides', url: absoluteUrl('/blog') },
          { name: category?.name ?? slug, url: absoluteUrl(`/blog/category/${slug}`) },
        ])}
      />

      <BlogListContent
        categories={categories}
        categorySlug={slug}
        initialPosts={posts}
        title={category?.name ?? 'Guides'}
        subtitle={category?.description ?? undefined}
        trailingCrumb={category?.name ?? slug}
      />
    </>
  );
}
