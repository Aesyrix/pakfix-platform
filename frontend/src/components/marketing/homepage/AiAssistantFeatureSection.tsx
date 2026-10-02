'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MessageSquare, Camera, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function AiAssistantFeatureSection() {
  const [activeQuery, setActiveQuery] = useState('fridge');

  const demoResults = {
    fridge: {
      query: 'My refrigerator is making a clicking sound every few minutes.',
      causes: ['Compressor start relay failure', 'Voltage stabilizer fluctuation', 'Condenser coil overheating'],
      risk: 'Medium Risk',
      diy: 'Basic plug/voltage check only',
      pro: 'Appliance Technician',
      estimate: 'PKR 2,500 – 7,500',
    },
    ac: {
      query: 'Water is dripping from the indoor unit of my split AC.',
      causes: ['Clogged condensate drain line', 'Frozen evaporator coils', 'Incorrect indoor unit tilt'],
      risk: 'Low Risk',
      diy: 'Clear visible drain pipe obstruction',
      pro: 'AC Service Specialist',
      estimate: 'PKR 1,500 – 3,500',
    },
    water: {
      query: 'Water motor turns on but no water reaches the overhead tank.',
      causes: ['Air lock in suction line', 'Worn out impeller seal', 'Low main water supply pressure'],
      risk: 'Low-Medium Risk',
      diy: 'Check foot valve and prime pump',
      pro: 'Plumber / Motor Technician',
      estimate: 'PKR 2,000 – 5,000',
    },
  };

  const current = demoResults[activeQuery as keyof typeof demoResults];

  return (
    <section className="py-16 sm:py-24 bg-[#EAF7F0] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#006838] text-xs font-bold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#00824A]" />
            Smart AI Repair Guidance
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            Not sure what&apos;s wrong?<br />
            <span className="text-[#00824A]">Ask PakFix AI.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#475467]">
            Describe the symptoms or upload photos. PakFix AI evaluates safety risks, predicts estimated repair costs in PKR, and connects you to the right local professional.
          </p>
        </div>

        {/* 3 Input Method Pill Headers */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#EAF7F0] text-[#00532C] font-bold flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#161616]">1. Describe It</h3>
              <p className="text-xs text-[#667085] mt-0.5">Tell PakFix what happened in English or Roman Urdu.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#DBEAFE] text-[#2563EB] font-bold flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#161616]">2. Show It</h3>
              <p className="text-xs text-[#667085] mt-0.5">Upload photos or short video clips of the issue.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#EAF7F0] text-[#00532C] font-bold flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#161616]">3. Get Guidance</h3>
              <p className="text-xs text-[#667085] mt-0.5">Receive safety level, PKR cost estimate & matching pro.</p>
            </div>
          </div>
        </div>

        {/* Interactive Demo Interface */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-card p-6 lg:p-8">
          {/* Query Preset Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#E5E7EB] pb-4">
            <span className="text-xs font-bold text-[#667085] mr-2">Try interactive sample:</span>
            <button
              type="button"
              onClick={() => setActiveQuery('fridge')}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeQuery === 'fridge'
                  ? 'bg-[#00824A] text-white'
                  : 'bg-[#F8FAF9] text-[#475467] hover:bg-[#EAF7F0]'
              }`}
            >
              Fridge Clicking
            </button>
            <button
              type="button"
              onClick={() => setActiveQuery('ac')}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeQuery === 'ac'
                  ? 'bg-[#00824A] text-white'
                  : 'bg-[#F8FAF9] text-[#475467] hover:bg-[#EAF7F0]'
              }`}
            >
              AC Water Dripping
            </button>
            <button
              type="button"
              onClick={() => setActiveQuery('water')}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeQuery === 'water'
                  ? 'bg-[#00824A] text-white'
                  : 'bg-[#F8FAF9] text-[#475467] hover:bg-[#EAF7F0]'
              }`}
            >
              Water Pump Issue
            </button>
          </div>

          {/* Prompt Display */}
          <div className="bg-[#F8FAF9] rounded-xl p-3.5 border border-[#E5E7EB] text-sm text-[#161616] mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#667085] block">Customer Prompt:</span>
              <span className="font-semibold text-[#161616]">&quot;{current.query}&quot;</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 rounded bg-[#EAF7F0] text-[#006838]">
              Verified AI Output
            </span>
          </div>

          {/* AI Result Card Layout */}
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#667085]">Possible Causes:</h4>
              <ul className="space-y-2">
                {current.causes.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-xs font-semibold text-[#161616]">
                    <CheckCircle className="h-4 w-4 text-[#00824A]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F8FAF9] p-4 rounded-xl space-y-2.5 border border-[#E5E7EB] text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Risk Level:</span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {current.risk}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Safe DIY Action:</span>
                <span className="font-semibold text-[#161616]">{current.diy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Recommended Service:</span>
                <span className="font-bold text-[#00824A]">{current.pro}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
                <span className="text-[#006838] font-bold">Estimated Cost:</span>
                <span className="font-extrabold text-sm text-[#006838]">{current.estimate}</span>
              </div>
            </div>
          </div>

          {/* CTA Bar */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="text-xs text-[#667085]">Have a real home issue right now?</span>
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>Try PakFix AI Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
