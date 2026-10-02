import type { Metadata } from 'next';
import { CmsPageView } from '@/components/marketing/views/CmsPageView';
import { contentApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { isShell, pageMetadata, SHELL, shellMetadata } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

/**
 * Pages an admin creates from the dashboard.
 *
 * Only the shell is built: these pages are created after a deploy by
 * definition, so Laravel always resolves them at request time and fills in
 * the title and description.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ slug: SHELL }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  if (isShell(slug)) return shellMetadata();

  const page = await safeFetch(() => contentApi.page(slug), null, `cms page ${slug}`);

  return pageMetadata({
    title: page?.seo.title ?? page?.title ?? 'Page',
    description: page?.seo.description ?? undefined,
    path: `/pages/${slug}`,
  });
}

export default async function DynamicCmsPage({ params }: Params) {
  const { slug } = await params;
  const initial = isShell(slug) ? null : await safeFetch(() => contentApi.page(slug), null, `cms page ${slug}`);

  return <CmsPageView slug={isShell(slug) ? null : slug} initial={initial} />;
}
