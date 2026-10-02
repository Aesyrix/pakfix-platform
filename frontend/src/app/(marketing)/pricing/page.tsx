import type { Metadata } from 'next';
import Link from 'next/link';
import { DollarSign, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { CostEstimatorSection } from '@/components/marketing/homepage/CostEstimatorSection';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Service Pricing & PKR Estimates | PakFix.pk',
  description:
    'Transparent pricing guidelines for plumbing, electrical, AC repair and appliance maintenance across Pakistan. No hidden fees.',
  path: '/pricing',
});

export default function PricingPage() {
  const priceGrid = [
    { service: 'Plumbing Repair', visitFee: 'PKR 500 – 1,000', labour: 'PKR 1,000 – 2,500', time: '1-2 Hours' },
    { service: 'Electrical Wiring / DB', visitFee: 'PKR 500 – 1,000', labour: 'PKR 1,200 – 3,000', time: '1-3 Hours' },
    { service: 'AC Master Service', visitFee: 'PKR 500 – 1,000', labour: 'PKR 1,500 – 2,500', time: '1-2 Hours' },
    { service: 'AC Gas Refill', visitFee: 'Included', labour: 'PKR 3,500 – 5,500', time: '1 Hour' },
    { service: 'Appliance Repair', visitFee: 'PKR 500 – 1,200', labour: 'PKR 1,500 – 4,000', time: '1-2 Hours' },
    { service: 'Water Motor Pump', visitFee: 'PKR 500 – 1,000', labour: 'PKR 1,500 – 3,000', time: '1-2 Hours' },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Pricing' }]}
        title="Transparent Market Pricing"
        subtitle="Upfront market price ranges for labor and inspection. Know what to expect before booking."
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Price Table Card */}
            <div className="bg-[#F8FAF9] rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-card space-y-6">
              <h2 className="text-xl font-extrabold text-[#161616]">Standard Service Rate Card (PKR)</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#667085] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Inspection / Visit Fee</th>
                      <th className="py-3 px-4">Standard Labour Range</th>
                      <th className="py-3 px-4">Est. Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] font-medium text-[#161616]">
                    {priceGrid.map((row) => (
                      <tr key={row.service} className="hover:bg-white transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#00824A]">{row.service}</td>
                        <td className="py-3.5 px-4">{row.visitFee}</td>
                        <td className="py-3.5 px-4 font-bold">{row.labour}</td>
                        <td className="py-3.5 px-4 text-[#667085]">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Calculator Component */}
            <CostEstimatorSection />
          </div>
        </Container>
      </section>
    </>
  );
}
