import { Sparkles, ShieldCheck, DollarSign, Lock } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function TrustStripSection() {
  const items = [
    {
      icon: Sparkles,
      title: 'AI-Powered Diagnosis',
      desc: 'Instant, accurate problem identification',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Professionals',
      desc: 'Identity and skill checked technicians',
    },
    {
      icon: DollarSign,
      title: 'Transparent Quotes',
      desc: 'No hidden charges or unexpected fees',
    },
    {
      icon: Lock,
      title: 'Secure Booking',
      desc: 'Safe & hassle-free payment handling',
    },
  ];

  return (
    <section className="py-6 border-b border-[#E5E7EB] bg-[#F8FAF9]">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF7F0] text-[#00532C]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#161616]">{item.title}</h3>
                  <p className="text-[11px] text-[#667085] leading-snug mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
