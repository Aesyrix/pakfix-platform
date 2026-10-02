import type { Metadata } from 'next';
import { breadcrumbSchema, JsonLd } from '@/components/marketing/JsonLd';
import { ArticleView } from '@/components/marketing/views/ArticleView';
import { blogApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, isShell, pageMetadata, SHELL, shellMetadata } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

/**
 * Every published article at build time, plus a shell. Articles published
 * afterwards are served by Laravel using that shell, with the real title and
 * description written into it.
 */
export async function generateStaticParams() {
  const posts = await safeFetch(() => blogApi.posts({ per_page: 50 }).then((r) => r.data), [], 'article slugs');

  return [...posts.map((post) => ({ slug: post.slug })), { slug: SHELL }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  if (isShell(slug)) return shellMetadata();

  const data = await safeFetch(() => blogApi.post(slug), null, `article ${slug}`);

  if (!data) return pageMetadata({ title: 'Guide not found', path: `/blog/${slug}`, noindex: true });

  return pageMetadata({
    title: data.post.seo.title,
    description: data.post.seo.description,
    path: `/blog/${slug}`,
    type: 'article',
  });
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const initial = isShell(slug) ? null : await safeFetch(() => blogApi.post(slug), null, `article ${slug}`);

  return (
    <>
      {initial ? (
        <JsonLd
          data={[
            {
              '@type': 'BlogPosting',
              headline: initial.post.title,
              description: initial.post.seo.description,
              datePublished: initial.post.published_at ?? undefined,
              dateModified: initial.post.updated_at ?? initial.post.published_at ?? undefined,
              author: initial.post.author ? { '@type': 'Person', name: initial.post.author.name } : undefined,
              publisher: { '@type': 'Organization', name: 'PakFix', url: absoluteUrl('/') },
              mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
              image: initial.post.featured_image_url ?? undefined,
              ...(initial.post.schema_markup ?? {}),
            },
            breadcrumbSchema([
              { name: 'Home', url: absoluteUrl('/') },
              { name: 'Guides', url: absoluteUrl('/blog') },
              { name: initial.post.title, url: absoluteUrl(`/blog/${slug}`) },
            ]),
          ]}
        />
      ) : null}

      <ArticleView slug={isShell(slug) ? null : slug} initial={initial} />
    </>
  );
}
