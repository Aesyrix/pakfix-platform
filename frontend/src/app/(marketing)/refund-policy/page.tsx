import type { Metadata } from 'next';
import { RichText } from '@/components/marketing/Cards';
import { PageHeader } from '@/components/marketing/PageHeader';
import { Container } from '@/components/ui/Container';
import { contentApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import { pageMetadata } from '@/lib/seo';

/**
 * Served from the CMS, so support and legal can change the wording from the
 * admin dashboard without a deploy.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await safeFetch(() => contentApi.page('refund-policy'), null, 'refund policy');

  return pageMetadata({
    title: page?.seo.title ?? 'Refund Policy',
    description: page?.seo.description ?? 'How PakFix handles refunds, cancellations and disputed jobs.',
    path: '/refund-policy',
  });
}

export default async function RefundPolicyPage() {
  const page = await safeFetch(() => contentApi.page('refund-policy'), null, 'refund policy');

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Refund Policy' }]}
        title={page?.title ?? 'Refund Policy'}
        subtitle={
          page?.updated_at
            ? `Last updated ${new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(page.updated_at))}`
            : undefined
        }
        size="narrow"
      />

      <Container size="narrow" className="py-12 sm:py-16">
        {page?.body_html ? (
          <RichText html={page.body_html} />
        ) : (
          <div className="rich-text">
            <p>
              If a job is not done properly, raise a dispute from the booking within PakFix. Support reviews the
              evidence from both sides and can order a partial or full refund.
            </p>
            <h2>Before work starts</h2>
            <p>
              Cancel a booking before the professional sets off and nothing is charged. If they have already travelled,
              the visit fee shown on the booking may still apply.
            </p>
            <h2>After work is done</h2>
            <p>
              You have the chance to confirm the work. If something is wrong, raise a dispute rather than confirming,
              and support will look at it.
            </p>
            <h2>How refunds are paid</h2>
            <p>
              A refund goes back the way you paid. Cash jobs are refunded by bank transfer or Easypaisa, usually within
              five working days of a decision.
            </p>
            <p>
              <strong>This page is a placeholder and must be reviewed by a Pakistani legal adviser before launch.</strong>
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
