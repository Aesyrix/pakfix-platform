'use client';

import Link from 'next/link';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import { useT } from '@/components/i18n/LocaleProvider';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useT();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row bg-background">
      {/* Left Marketing/Branding Panel (Desktop Split) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#052E16] via-[#0F172A] to-[#1E3A8A] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Subtle Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#22C55E_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="relative z-10">
          <Link href="/" aria-label={t('PakFix home', 'پاک فکس ہوم')} className="inline-block">
            <PakFixLogo isDarkBackground className="h-10" />
          </Link>
          <div className="mt-12 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00824A]/20 px-3.5 py-1 text-xs font-bold text-[#4ADE80] border border-[#00824A]/40">
              <Sparkles className="h-3.5 w-3.5" />
              {t('Trusted Home Services Platform', 'قابلِ اعتماد ہوم سروسز پلیٹ فارم')}
            </span>
            <h2 className="text-3xl font-extrabold leading-tight">
              {t(
                "Pakistan's #1 AI-Powered Repair & Maintenance Platform",
                'پاکستان کا نمبر 1 اے آئی سے چلنے والا ریپیئر اور مینٹیننس پلیٹ فارم'
              )}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t(
                'Join thousands of Pakistani homeowners and verified service professionals. Book repairs with upfront PKR estimates and complete safety audits.',
                'ہزاروں پاکستانی گھر مالکان اور تصدیق شدہ سروس پروفیشنلز میں شامل ہوں۔ پہلے سے PKR تخمینے اور مکمل سیفٹی آڈٹ کے ساتھ مرمت بک کریں۔'
              )}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 pt-8 border-t border-slate-700/60">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
            <span>{t('100% Identity Verified Professionals', '100% تصدیق شدہ شناخت والے پروفیشنلز')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
            <span>{t('Transparent Upfront Quotes', 'شفاف اور پیشگی کوٹیشن')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-200">
            <ShieldCheck className="h-4 w-4 text-[#4ADE80]" />
            <span>{t('Complete Repair Guarantee', 'مکمل مرمت کی ضمانت')}</span>
          </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        <header className="flex items-center justify-center lg:hidden pb-6">
          <Link href="/" aria-label={t('PakFix home', 'پاک فکس ہوم')}>
            <PakFixLogo className="h-9" />
          </Link>
        </header>

        <main id="main" className="mx-auto w-full max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}
