import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, FileText, UserCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function AiToProHandoffSection() {
  const steps = [
    { title: '1. AI Diagnosis', desc: 'Photos & symptoms analyzed automatically', icon: Sparkles },
    { title: '2. Recommended Service', desc: 'Identifies exact technician skill needed', icon: ShieldCheck },
    { title: '3. Request Quotes', desc: 'Diagnosis attached automatically without retyping', icon: FileText },
    { title: '4. Book Professional', desc: 'Select verified pro and track arrival', icon: UserCheck },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">Seamless Handoff</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            From AI diagnosis to job completed.<br />
            <span className="text-[#008A4B]">Zero repetitive typing.</span>
          </h2>
          <p className="text-sm text-[#475467]">
            When you diagnose an issue with PakFix AI, your photos, safety details and description carry directly into your pro booking request.
          </p>
        </div>

        {/* 4 Steps Flow */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-[#F8FAF9] rounded-2xl p-5 border border-[#E5E7EB] relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#008A4B] mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#161616]">{step.title}</h3>
                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">{step.desc}</p>
                </div>

                {index < 3 ? (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-[#008A4B] font-bold">
                    &rarr;
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
