import { MessageSquareText, SlidersHorizontal, UserCheck, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      icon: MessageSquareText,
      title: "Tell Us What's Wrong",
      desc: 'Describe the issue using simple text, upload a photo or video, or use PakFix AI diagnosis.',
    },
    {
      num: '02',
      icon: SlidersHorizontal,
      title: 'Choose How to Proceed',
      desc: 'Review AI cost estimate in PKR, request quotes from multiple pros, or book a service directly.',
    },
    {
      num: '03',
      icon: UserCheck,
      title: 'Connect With a Professional',
      desc: 'Match with top-rated, identity-verified local technicians in your city.',
    },
    {
      num: '04',
      icon: CheckCircle2,
      title: 'Get It Fixed & Track',
      desc: 'Track arrival in real time, inspect the work, pay securely, and store repair history.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">Simple Process</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            From problem to fixed.
          </h2>
          <p className="text-sm text-[#475467]">
            Four easy steps to get any home repair done with complete transparency and trust.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-2xs relative flex flex-col justify-between group hover:border-[#008A4B] hover:shadow-card transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF7F0] text-[#008A4B] group-hover:bg-[#008A4B] group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-extrabold text-[#E5E7EB] group-hover:text-[#008A4B] transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#161616] mb-2">{step.title}</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">{step.desc}</p>
                </div>

                {idx < 3 ? (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="h-6 w-6 rounded-full bg-white border border-[#E5E7EB] text-[#008A4B] flex items-center justify-center text-xs font-bold shadow-2xs">
                      &rarr;
                    </div>
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
