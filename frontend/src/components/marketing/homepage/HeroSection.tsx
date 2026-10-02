'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Camera,
  Upload,
  Video,
  Mic,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function HeroSection() {
  const [problemText, setProblemText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const quickExamples = [
    'Tap is leaking in bathroom',
    'AC is running but not cooling',
    'Washing machine making loud noise',
    'Power keeps tripping constantly',
  ];

  const handleExampleClick = (example: string) => {
    setProblemText(example);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F4FBF7] via-white to-white py-10 lg:py-16 border-b border-[#E5E7EB]">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT SIDE: Hero Content & AI Input Box */}
          <div className="lg:col-span-7 space-y-6">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF7F0] border border-[#C2ECCF] text-[#006838] text-xs font-bold shadow-2xs">
              <Sparkles className="h-4 w-4 text-[#00824A]" />
              <span>AI-powered home repair assistance</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#161616] tracking-tight leading-[1.15]">
              Show the Problem.<br />
              <span className="text-[#00824A]">PakFix Helps You Fix It.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#475467] leading-relaxed max-w-xl">
              Describe the issue, upload a photo or video, and PakFix can help identify the problem and connect you with a trusted local professional.
            </p>

            {/* MAIN AI PROBLEM CARD */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-card space-y-4 relative">
              <div className="flex items-center justify-between">
                <label htmlFor="ai-problem-input" className="text-sm font-bold text-[#161616] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#00824A]" />
                  What needs fixing?
                </label>
                <span className="text-[11px] text-[#667085] font-medium">Free AI Diagnosis</span>
              </div>

              {/* Text Area Input */}
              <div className="relative">
                <textarea
                  id="ai-problem-input"
                  rows={3}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="e.g. My AC is running but not cooling, making a click sound..."
                  className="w-full rounded-xl border border-[#E5E7EB] p-3.5 text-sm text-[#161616] placeholder-[#9CA3AF] focus:border-[#00824A] focus:ring-2 focus:ring-[#00824A]/20 outline-none transition-all resize-none"
                />
              </div>

              {/* File Attachment Pill Preview */}
              {selectedFile ? (
                <div className="flex items-center justify-between bg-[#EAF7F0] px-3 py-1.5 rounded-lg text-xs text-[#006838]">
                  <span className="truncate max-w-[200px] font-medium">Attached: {selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-700 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              {/* Input Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Media Actions */}
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] text-xs font-semibold text-[#475467] hover:bg-[#EAF7F0] hover:text-[#006838] transition-colors cursor-pointer">
                    <Camera className="h-3.5 w-3.5 text-[#00824A]" />
                    <span>Camera</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                  </label>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] text-xs font-semibold text-[#475467] hover:bg-[#EAF7F0] hover:text-[#006838] transition-colors cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-[#00824A]" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] text-xs font-semibold text-[#475467] hover:bg-[#EAF7F0] hover:text-[#006838] transition-colors cursor-pointer hidden sm:inline-flex">
                    <Video className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span>Upload Video</span>
                    <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={() => setProblemText((prev) => prev + ' [Voice note recorded]')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] text-xs font-semibold text-[#475467] hover:bg-[#EAF7F0] hover:text-[#006838] transition-colors cursor-pointer hidden sm:inline-flex"
                  >
                    <Mic className="h-3.5 w-3.5 text-[#00824A]" />
                    <span>Voice</span>
                  </button>
                </div>

                {/* Primary CTA Button */}
                <Link
                  href={{ pathname: '/ai', query: { text: problemText } }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all group"
                >
                  <span>Diagnose My Problem</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Quick Problem Example Chips */}
              <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Quick examples:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickExamples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => handleExampleClick(ex)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FAF9] hover:bg-[#EAF7F0] border border-[#E5E7EB] text-[#475467] hover:text-[#006838] font-medium transition-colors cursor-pointer"
                    >
                      &quot;{ex}&quot;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Product UI Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#00824A]/20 p-5 shadow-floating relative overflow-hidden">
              {/* Header Bar inside preview */}
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00824A] animate-ping" />
                  <span className="text-xs font-extrabold text-[#161616] tracking-wide">PAKFIX AI DIAGNOSIS</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#EAF7F0] text-[#006838]">
                  Instant AI Result
                </span>
              </div>

              {/* Mock Upload Image Preview */}
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-100 border border-[#E5E7EB] mb-4">
                <Image
                  src="/images/pakfix_hero_ai_section_1790117108503.png"
                  alt="PakFix AI Diagnosis Demo"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-xs">
                  Photo Analyzed
                </div>
              </div>

              {/* AI Diagnostic Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF9]">
                  <span className="text-[#667085]">Possible Issue:</span>
                  <span className="font-bold text-[#161616]">Loose P-Trap Connection / Seal</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF9]">
                  <span className="text-[#667085]">AI Confidence:</span>
                  <span className="font-extrabold text-[#00824A]">95% High Confidence</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF9]">
                  <span className="text-[#667085]">Safety Risk:</span>
                  <span className="font-bold text-[#00824A] flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Low Risk (Generally Safe)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#EAF7F0]">
                  <span className="text-[#006838] font-semibold">Estimated Repair:</span>
                  <span className="font-extrabold text-[#006838] text-sm">PKR 1,500 – 3,000</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-4">
                <Link
                  href="/ai"
                  className="inline-flex items-center justify-center text-xs font-bold py-2.5 rounded-xl border border-[#E5E7EB] text-[#161616] hover:bg-[#F8FAF9] transition-colors"
                >
                  View Safe Checks
                </Link>
                <Link
                  href="/find-a-technician"
                  className="inline-flex items-center justify-center text-xs font-bold py-2.5 rounded-xl bg-[#00824A] text-white hover:bg-[#006B3C] transition-colors shadow-xs"
                >
                  Book Plumber
                </Link>
              </div>

              {/* Verified Technician Badge Card Underneath */}
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[#00824A] text-white font-bold text-xs flex items-center justify-center">
                    AR
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-[#161616]">Ali Raza</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00824A] fill-[#00824A]" />
                    </div>
                    <span className="text-[10px] text-[#667085]">Master Plumber &bull; Lahore</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-bold text-[#161616]">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>4.9 (120+)</span>
                  </div>
                  <span className="text-[10px] text-[#00824A] font-bold">Available Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
