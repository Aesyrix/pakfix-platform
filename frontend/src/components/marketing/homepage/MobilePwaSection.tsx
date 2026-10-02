import Link from 'next/link';
import { Smartphone, Download, Sparkles, Bell, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function MobilePwaSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#EAF7F0] border-b border-[#E5E7EB]">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#006838] text-xs font-bold">
              <Smartphone className="h-3.5 w-3.5 text-[#008A4B]" />
              PWA & Mobile Ready
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
              PakFix goes wherever your home needs help.
            </h2>

            <p className="text-sm text-[#475467] leading-relaxed">
              Install the PakFix Web App on your phone in seconds. Access AI diagnosis, live job tracking, technician messaging and maintenance alerts anywhere.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#161616]">
                <CheckCircle2 className="h-4 w-4 text-[#008A4B]" />
                <span>Instant AI Assistant</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#161616]">
                <CheckCircle2 className="h-4 w-4 text-[#008A4B]" />
                <span>Live Technician Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#161616]">
                <CheckCircle2 className="h-4 w-4 text-[#008A4B]" />
                <span>Smart Maintenance Reminders</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#161616]">
                <CheckCircle2 className="h-4 w-4 text-[#008A4B]" />
                <span>Zero App Store Download Needed</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008A4B] hover:bg-[#007541] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Install PakFix Web App</span>
              </button>

              <span className="text-xs font-semibold text-[#667085] px-3 py-2 rounded-xl bg-white border border-[#E5E7EB]">
                Android & iOS Apps — Coming Soon
              </span>
            </div>
          </div>

          {/* Right Phone Mockup graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-64 bg-[#161616] p-3 rounded-[40px] border-4 border-gray-800 shadow-2xl relative">
              <div className="h-5 w-24 bg-gray-900 rounded-full mx-auto mb-3" />
              <div className="bg-white rounded-[28px] p-4 text-xs space-y-3 min-h-[380px]">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-extrabold text-[#161616]">PakFix App</span>
                  <span className="h-2 w-2 rounded-full bg-[#008A4B]" />
                </div>
                <div className="bg-[#EAF7F0] p-3 rounded-xl text-[11px] text-[#006838] font-semibold">
                  AI Diagnosis: AC Filter & Gas Issue
                </div>
                <div className="bg-[#F8FAF9] p-3 rounded-xl border space-y-1">
                  <span className="text-[10px] text-[#667085]">Technician Assigned</span>
                  <p className="font-bold text-[#161616]">Ali Raza &bull; Arriving in 15 mins</p>
                </div>
                <div className="bg-[#008A4B] text-white p-3 rounded-xl font-bold text-center">
                  Book Professional
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
