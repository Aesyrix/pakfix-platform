import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy | PakFix.pk',
  description: 'PakFix privacy policy and data protection guidelines.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Privacy Policy' }]}
        title="Privacy Policy"
        subtitle="Last updated: January 2026"
      />
      <section className="py-12 sm:py-20 bg-white">
        <Container size="narrow">
          <div className="prose max-w-none text-xs sm:text-sm text-[#475467] leading-relaxed space-y-6">
            <h2 className="text-lg font-bold text-[#161616]">1. Data We Collect</h2>
            <p>
              When you use PakFix, we collect information you provide directly, such as your name, phone number, address, and problem descriptions or photos uploaded for AI diagnosis.
            </p>
            <h2 className="text-lg font-bold text-[#161616]">2. How We Use Your Data</h2>
            <p>
              We use your data solely to connect you with verified local service professionals, process repair requests, provide AI diagnostic feedback, and improve platform safety.
            </p>
            <h2 className="text-lg font-bold text-[#161616]">3. Data Protection</h2>
            <p>
              We implement industry-standard encryption to protect your personal details and will never sell your personal information to third-party advertisers.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
