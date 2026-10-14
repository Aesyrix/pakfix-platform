'use client';

import { RichText } from '@/components/marketing/Cards';
import { PageHeader } from '@/components/marketing/PageHeader';
import { PageLoadError, PageSkeleton } from '@/components/marketing/PageStates';
import { Container } from '@/components/ui/Container';
import { useFormatDate, useT } from '@/components/i18n/LocaleProvider';
import { usePublicData, useResolvedSlug } from '@/hooks/usePublicData';
import { contentApi } from '@/lib/api/endpoints';
import type { CmsPage } from '@/lib/api/types';

/** Any page an admin creates in the dashboard, served at /pages/<slug>. */
export function CmsPageView({ slug: builtSlug, initial }: { slug: string | null; initial: CmsPage | null }) {
  const t = useT();
  const formatDate = useFormatDate();
  const slug = useResolvedSlug(builtSlug, 1);
  const query = usePublicData(['cms-page', slug], () => contentApi.page(slug as string), initial, Boolean(slug));

  if (!query.data) {
    return query.isError ? (
      <PageLoadError error={query.error} onRetry={() => query.refetch()} notFoundTitle={t('That page does not exist', 'وہ صفحہ موجود نہیں')} />
    ) : (
      <PageSkeleton />
    );
  }

  const page = query.data;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: page.title }]}
        title={page.title}
        subtitle={
          page.updated_at
            ? t(`Last updated ${formatDate(page.updated_at)}`, `آخری تازہ کاری ${formatDate(page.updated_at)}`)
            : undefined
        }
        size="narrow"
      />

      <Container size="narrow" className="py-12 sm:py-16">
        <RichText html={page.body_html} />
      </Container>
    </>
  );
}
