'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Wrench } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function FinalCtaSection() {
  const [text, setText] = useState('');

  return (
    <section className="py-20 sm:py-28 bg-[#161616] text-white relative overflow-hidden border-b border-gray-800">
      <Container size="narrow">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00824A]/20 border border-[#00824A]/30 text-[#00A85B] text-xs font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Ready to Fix It?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Something needs fixing?
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-lg mx-auto">
            Show PakFix the problem and get an instant AI diagnosis or book a trusted professional today.
          </p>

          {/* Quick Input Bar inside Dark CTA */}
          <div className="mt-8 max-w-xl mx-auto bg-gray-900 p-2 rounded-2xl border border-gray-800 flex items-center gap-2 shadow-2xl">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your home problem..."
              className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none"
            />

            <Link
              href={{ pathname: '/ai', query: { text } }}
              className="px-5 py-2.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold transition-colors shrink-0"
            >
              Ask PakFix AI
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ai"
              className="px-6 py-3 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold transition-colors shadow-md"
            >
              Ask PakFix AI
            </Link>

            <Link
              href="/find-a-technician"
              className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition-colors border border-gray-700"
            >
              Book a Professional
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
