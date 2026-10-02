'use client';

import { Sparkles, ShieldCheck, Wrench, ArrowUpRight, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import Link from 'next/link';

export function HeroProductVisual() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Decorative Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#16A34A]/20 via-[#2563EB]/20 to-[#16A34A]/10 blur-2xl opacity-70 pointer-events-none" />

      {/* Main Container Layered Visual */}
      <div className="relative rounded-3xl border border-[var(--border)] bg-surface p-5 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#16A34A] to-[#2563EB] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">PakFix AI Live Diagnostic</p>
              <p className="text-[10px] text-ink-500">Multimodal Instant Analysis</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[11px] font-bold text-[#15803D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            86% Confidence
          </span>
        </div>

        {/* Customer Input Preview Layer */}
        <div className="rounded-2xl border border-[var(--border)] bg-surface-muted/60 p-3.5 mb-4">
          <div className="flex items-start gap-3">
            <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-ink-200 border border-[var(--border)]">
              {/* Simulated photo visual */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white">
                <Wrench className="h-6 w-6 text-[#4ADE80]" />
              </div>
              <span className="absolute bottom-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#16A34A] text-[8px] text-white">
                ✓
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider">Customer Upload</span>
              <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                &ldquo;Water leaking under kitchen sink pipe when faucet runs&rdquo;
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-medium bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3 w-3" /> Photo Analyzed
                </span>
                <span className="text-[11px] text-ink-500">Lahore, Gulberg III</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Diagnostic Output Card */}
        <div className="rounded-2xl border border-[#2563EB]/30 bg-gradient-to-br from-[#EFF6FF]/70 to-[#F0FDF4]/70 p-4 mb-4 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Likely Problem
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-bold text-[#15803D]">
              <ShieldCheck className="h-3 w-3 text-[#16A34A]" /> Safe to Inspect
            </span>
          </div>

          <h4 className="text-base font-bold text-foreground">Loose Sink Drain Pipe & Washer Wear</h4>
          <p className="mt-1 text-xs text-ink-600 leading-relaxed">
            Minor plumbing fault. Pipe coupling loose near P-trap. No main line emergency detected.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-ink-200/50 dark:border-slate-800">
            <div>
              <p className="text-[10px] text-ink-500 font-medium">Estimated Repair Cost</p>
              <p className="text-sm font-extrabold text-[#16A34A]">PKR 1,500 &ndash; 3,000</p>
            </div>
            <div>
              <p className="text-[10px] text-ink-500 font-medium">Recommended Action</p>
              <p className="text-xs font-bold text-foreground">Book Local Plumber</p>
            </div>
          </div>
        </div>

        {/* Recommended Technician Preview Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-surface p-3.5 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#16A34A] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                AH
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#16A34A] border-2 border-white flex items-center justify-center text-[9px] text-white">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">Tariq Mahmood</p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#DCFCE7] px-1.5 py-0.2 text-[9px] font-extrabold text-[#15803D]">
                  <UserCheck className="h-2.5 w-2.5 text-[#16A34A]" /> Verified
                </span>
              </div>
              <p className="text-[11px] text-ink-500 flex items-center gap-1">
                <span>★ 4.9 (128 jobs)</span>
                <span>•</span>
                <span>Gulberg, Lahore</span>
              </p>
            </div>
          </div>

          <Link
            href="/find-a-technician"
            className="inline-flex items-center gap-1 rounded-xl bg-[#16A34A] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#15803D] transition-colors shrink-0"
          >
            Book Now
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
