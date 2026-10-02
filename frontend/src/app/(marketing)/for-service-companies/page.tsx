import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'For Service Companies | PakFix.pk Partner Network',
  description:
    'Register your service enterprise or agency on PakFix. Dispatch teams of technicians, manage corporate quotes, and scale your operations.',
  path: '/for-service-companies',
});

export default function ServiceCompaniesPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'For Service Companies' }]}
        title="Enterprise Service Company Portal"
        subtitle="Manage teams of technicians, assign local job leads, issue automated digital quotes, and grow your revenue."
      />
      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="bg-[#161616] text-white rounded-3xl p-8 sm:p-12 border border-gray-800 text-center space-y-6">
            <Building2 className="h-12 w-12 text-[#00A85B] mx-auto" />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Scale Your Home Service Enterprise
            </h2>
            <p className="text-sm text-gray-300 max-w-xl mx-auto">
              Register your company on PakFix to unlock multi-technician dispatch, corporate invoicing, and lead management.
            </p>
            <div>
              <Link
                href="/become-a-technician"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all"
              >
                <span>Register Your Service Company</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
