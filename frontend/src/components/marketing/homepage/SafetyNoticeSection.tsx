import Link from 'next/link';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function SafetyNoticeSection() {
  const hazards = [
    { title: 'Gas Leaks & Smell', desc: 'Sui gas or LPG cylinder leaks require immediate professional shutoff.' },
    { title: 'High-Voltage Faults', desc: 'Main distribution box shorts or exposed 220V/440V wiring.' },
    { title: 'Structural Damage', desc: 'Load-bearing wall cracks, roof sagging, or ceiling collapse risk.' },
    { title: 'Major Water Flooding', desc: 'Burst main water supply lines or sewer backup emergencies.' },
  ];

  return (
    <section className="py-12 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="bg-[#FFF5F5] rounded-2xl border-2 border-[#DC2626]/20 p-6 sm:p-8 relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Header */}
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 text-[#B91C1C] text-xs font-bold">
                <ShieldAlert className="h-4 w-4" />
                <span>Safety Protocol</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#161616]">
                Some repairs should <span className="text-[#B91C1C]">never be DIY.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
                PakFix AI strictly classifies high-hazard situations as High Risk and instantly connects you with licensed professionals to protect your home and family.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B91C1C] hover:underline"
                >
                  <span>Read Emergency Safety Rules</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Hazards Grid */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
              {hazards.map((h) => (
                <div key={h.title} className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#161616]">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#B91C1C]" />
                    <span>{h.title}</span>
                  </div>
                  <p className="text-[11px] text-[#667085] leading-snug">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
