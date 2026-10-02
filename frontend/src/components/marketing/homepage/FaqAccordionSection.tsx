'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function FaqAccordionSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is PakFix?',
      a: 'PakFix is Pakistan’s smart home repair and property maintenance platform. It combines AI problem diagnosis with identity-verified local technicians for plumbing, electrical, AC repair, appliance care, and home improvement.',
    },
    {
      q: 'How does PakFix AI work?',
      a: 'You describe the problem in simple words or upload photos/videos. PakFix AI analyzes symptoms to identify potential causes, check safety risks, estimate repair costs in PKR, and recommend the right service specialist.',
    },
    {
      q: 'Is AI diagnosis a replacement for a technician?',
      a: 'No. PakFix AI provides immediate guidance and cost estimation, but physical repairs—especially electrical, gas or structural work—should always be inspected and completed by a verified human professional.',
    },
    {
      q: 'Can I upload photos or videos?',
      a: 'Yes. You can upload photos (JPG, PNG, WEBP) or short video clips showing the issue directly inside the AI box or booking forms.',
    },
    {
      q: 'Can I request multiple quotes?',
      a: 'Yes! You can request itemized quotes from multiple local professionals, compare labor and material charges side by side, and accept the offer that fits your budget.',
    },
    {
      q: 'How are professionals verified?',
      a: 'Every PakFix service professional undergoes identity verification (CNIC check), criminal record checks, skill review, and ongoing customer rating evaluations.',
    },
    {
      q: 'Which cities do you serve?',
      a: 'PakFix currently operates across Islamabad, Rawalpindi, Lahore, Karachi, Faisalabad, Peshawar, Multan, Gujranwala, Sialkot, and Quetta.',
    },
    {
      q: 'How do payments work?',
      a: 'You can pay cash on service completion, or pay digitally via bank transfer, JazzCash, EasyPaisa, or credit card directly in the PakFix app.',
    },
    {
      q: 'Can I book emergency repairs?',
      a: 'Yes. Select the Emergency urgency option for major plumbing leaks, electrical shorts, or severe breakdowns to receive urgent technician dispatch.',
    },
    {
      q: 'Can I manage more than one property?',
      a: 'Yes. Homeowners and property managers can add multiple homes or rental units to track appliances and maintenance history under a single account.',
    },
    {
      q: 'Can professionals register with PakFix?',
      a: 'Skilled technicians and registered service companies can click "Become a Pro" to complete onboarding and start receiving job requests.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container size="narrow">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">FAQ</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#475467]">
            Quick answers to common questions about PakFix AI, bookings and professionals.
          </p>
        </div>

        {/* Accordion Items */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#161616] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 text-[#008A4B] ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen ? (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-[#475467] leading-relaxed border-t border-[#E5E7EB] pt-3">
                    {faq.a}
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
