import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquareText,
  SlidersHorizontal,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'How PakFix Works | Smart Home Repair & Maintenance',
  description:
    'Learn how PakFix connects you with verified repair professionals in 4 easy steps: AI diagnosis, quote comparison, technician dispatch, and secure tracking.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      icon: MessageSquareText,
      title: "1. Tell Us What's Wrong",
      desc: 'Type a brief description of the problem, upload photos or video, or use PakFix AI to check safety hazards and causes automatically.',
      details: [
        'Voice dictation in English or Roman Urdu',
        'Photo & video diagnostic upload',
        'Automatic safety hazard assessment',
      ],
    },
    {
      num: '02',
      icon: SlidersHorizontal,
      title: '2. Compare Quotes & Prices',
      desc: 'Receive upfront PKR price ranges for labour and materials. Compare multiple itemized quotes side by side before scheduling.',
      details: [
        'Transparent labor and material cost estimates',
        'No hidden surprise fees on site',
        'Side-by-side technician quote comparison',
      ],
    },
    {
      num: '03',
      icon: UserCheck,
      title: '3. Match With Verified Professionals',
      desc: 'PakFix matches your job with top-rated, identity-checked local technicians in your city.',
      details: [
        '100% CNIC identity & criminal record verification',
        'Real customer ratings & completed job history',
        'Licensed plumbers, electricians, AC & appliance specialists',
      ],
    },
    {
      num: '04',
      icon: CheckCircle2,
      title: '4. Get It Fixed & Track Work',
      desc: 'Track arrival times in real time, inspect the completed job, pay via cash or digital transfer, and save repair history.',
      details: [
        'Real-time job tracking and arrival updates',
        'Cash, JazzCash, EasyPaisa or card payments',
        'Lifetime digital repair history for your property',
      ],
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'How It Works' }]}
        eyebrow={
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-[#00824A]" />
            Simple 4-Step Process
          </div>
        }
        title="How PakFix Works"
        subtitle="From problem diagnosis to completed job. We take the guesswork, hassle, and unfair pricing out of home repairs."
      />

      {/* Main Steps Timeline */}
      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="space-y-16">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 1;
              return (
                <div
                  key={step.num}
                  className={`grid lg:grid-cols-12 gap-8 items-center ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className={`lg:col-span-6 space-y-4 ${isEven ? 'lg:order-2' : ''}`}>
                    <span className="text-3xl font-extrabold text-[#00824A] tracking-wider">
                      {step.num}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#161616]">
                      {step.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
                      {step.desc}
                    </p>

                    <ul className="space-y-2.5 pt-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#161616]">
                          <CheckCircle2 className="h-4 w-4 text-[#00824A] shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`lg:col-span-6 ${isEven ? 'lg:order-1' : ''}`}>
                    <div className="bg-[#F8FAF9] rounded-3xl p-8 border border-[#E5E7EB] shadow-card space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F0] text-[#00532C]">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#006838] border border-[#E5E7EB]">
                          PakFix Standard
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] leading-relaxed">
                        Every step is backed by identity verification, automated price guidelines, and real-time support.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="py-12 bg-[#EAF7F0] border-t border-b border-[#E5E7EB]">
        <Container>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-2">
              <ShieldCheck className="h-8 w-8 text-[#00824A] mx-auto" />
              <h3 className="text-sm font-bold text-[#161616]">Verified Technicians</h3>
              <p className="text-xs text-[#667085]">CNIC checked, background audited & skilled.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-2">
              <Sparkles className="h-8 w-8 text-[#00824A] mx-auto" />
              <h3 className="text-sm font-bold text-[#161616]">AI Safety Audit</h3>
              <p className="text-xs text-[#667085]">Checks for gas, electrical & high-risk hazards.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-2">
              <PhoneCall className="h-8 w-8 text-[#00824A] mx-auto" />
              <h3 className="text-sm font-bold text-[#161616]">24/7 Customer Care</h3>
              <p className="text-xs text-[#667085]">Live phone and WhatsApp support across Pakistan.</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all"
            >
              <span>Try AI Diagnosis Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
