import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'For Property Managers & Landlords | PakFix.pk',
  description:
    'Manage repairs across multiple rental properties, tenant requests, and maintenance records with PakFix.',
  path: '/for-property-managers',
});

export default function PropertyManagersPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'For Property Managers' }]}
        title="Multi-Property Maintenance Portal"
        subtitle="Manage repairs across residential & commercial rental properties with centralized invoicing and verified technicians."
      />
      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="bg-[#F8FAF9] rounded-3xl p-8 sm:p-12 border border-[#E5E7EB] text-center space-y-6">
            <Home className="h-12 w-12 text-[#00824A] mx-auto" />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
              Streamline Tenant Repairs & Maintenance
            </h2>
            <p className="text-sm text-[#475467] max-w-xl mx-auto">
              Track work orders across 5, 20, or 100+ properties with complete job audit trails and transparent PKR billing.
            </p>
            <div>
              <Link
                href="/home-maintenance"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all"
              >
                <span>Add Your Properties</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
