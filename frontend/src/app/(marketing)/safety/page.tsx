import type { Metadata } from 'next';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Safety Rules & Pro Verification | PakFix.pk',
  description:
    'PakFix safety standards, CNIC technician background verification, and AI hazard detection for home repairs in Pakistan.',
  path: '/safety',
});

export default function SafetyPage() {
  const protocols = [
    {
      title: '1. CNIC & Background Checks',
      desc: 'Every technician on PakFix submits verified Pakistani CNIC credentials and undergoes background checks.',
    },
    {
      title: '2. AI Emergency Classification',
      desc: 'PakFix AI automatically flags high-risk gas leaks, electrical shorts, or structural risks and displays immediate safety instructions.',
    },
    {
      title: '3. Upfront Price Transparency',
      desc: 'Technicians confirm labor & material estimates prior to starting work to eliminate disputes.',
    },
    {
      title: '4. Verified Customer Reviews',
      desc: 'Only customers who completed a booking can rate and review technicians.',
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Safety' }]}
        title="Safety & Verification Standards"
        subtitle="Your family's safety and peace of mind are our highest priorities."
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {protocols.map((p) => (
              <div key={p.title} className="bg-[#F8FAF9] rounded-2xl p-6 border border-[#E5E7EB] space-y-3">
                <ShieldCheck className="h-8 w-8 text-[#00824A]" />
                <h3 className="text-base font-bold text-[#161616]">{p.title}</h3>
                <p className="text-xs text-[#667085] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
