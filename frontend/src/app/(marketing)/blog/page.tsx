import type { Metadata } from 'next';
import { breadcrumbSchema, JsonLd } from '@/components/marketing/JsonLd';
import { blogApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { BlogListContent } from './BlogListContent';

export const metadata: Metadata = pageMetadata({
  title: 'Home Maintenance Guides for Pakistan',
  description:
    'Practical guides on AC servicing, plumbing, electrical safety, appliances and seasonal maintenance, written for Pakistani homes.',
  path: '/blog',
});

export default async function BlogPage() {
  const [categories, posts] = await Promise.all([
    safeFetch(() => blogApi.categories(), [], 'blog categories'),
    safeFetch(() => blogApi.posts({ per_page: 12 }).then((r) => r.data), [], 'blog posts'),
  ]);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'Guides', url: absoluteUrl('/blog') },
          ]),
          {
            '@type': 'Blog',
            name: 'PakFix Home Guides',
            url: absoluteUrl('/blog'),
            blogPost: posts.slice(0, 10).map((post) => ({
              '@type': 'BlogPosting',
              headline: post.title,
              url: absoluteUrl(`/blog/${post.slug}`),
              datePublished: post.published_at ?? undefined,
            })),
          },
        ]}
      />

      <BlogListContent
        categories={categories}
        initialPosts={posts}
        title="Home maintenance guides"
        titleUr="گھر کی دیکھ بھال کے رہنما"
        subtitle="What goes wrong in Pakistani homes, what you can safely check yourself, and when to call a professional."
        subtitleUr="پاکستانی گھروں میں کیا خراب ہوتا ہے، آپ خود کیا محفوظ طریقے سے چیک کر سکتے ہیں، اور پروفیشنل کو کب بلانا چاہیے۔"
      />
    </>
  );
}
