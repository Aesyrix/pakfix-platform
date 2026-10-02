import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service | PakFix.pk',
  description: 'PakFix terms of service and platform user agreement.',
  path: '/terms-of-service',
});

export default function TermsOfServicePage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Terms of Service' }]}
        title="Terms of Service"
        subtitle="Last updated: January 2026"
      />
      <section className="py-12 sm:py-20 bg-white">
        <Container size="narrow">
          <div className="prose max-w-none text-xs sm:text-sm text-[#475467] leading-relaxed space-y-6">
            <h2 className="text-lg font-bold text-[#161616]">1. Platform Agreement</h2>
            <p>
              By accessing PakFix.pk or using our AI home diagnostic and technician booking tools, you agree to comply with these Terms of Service.
            </p>
            <h2 className="text-lg font-bold text-[#161616]">2. Service Bookings & Estimates</h2>
            <p>
              Prices shown in AI diagnostic outputs are market estimates. Final prices for labor and materials are agreed upon directly between the customer and the service professional prior to starting work.
            </p>
            <h2 className="text-lg font-bold text-[#161616]">3. Safety Disclaimer</h2>
            <p>
              PakFix AI provides educational guidance. For high-hazard electrical, Sui gas, or structural repairs, physical inspection by a licensed technician is strictly recommended.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
