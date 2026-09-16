import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { catalogueApi, contentApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';

/**
 * The public site shell. Server-rendered so search engines get the full page,
 * and so the brand details come from the CMS rather than from constants
 * compiled into the bundle.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bootstrap, popularCategories] = await Promise.all([
    safeFetch(() => contentApi.bootstrap(), null, 'bootstrap'),
    safeFetch(() => catalogueApi.categories({ popular: true }), [], 'popular categories'),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter bootstrap={bootstrap} popularCategories={popularCategories} />
    </div>
  );
}
