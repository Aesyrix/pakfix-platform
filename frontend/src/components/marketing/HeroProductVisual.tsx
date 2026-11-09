'use client';

import { Sparkles, ShieldCheck, Wrench, ArrowUpRight, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/components/i18n/LocaleProvider';

export function HeroProductVisual() {
  const t = useT();
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Decorative Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand-600/20 via-accent-600/20 to-brand-600/10 blur-2xl opacity-70 pointer-events-none" />

      {/* Main Container Layered Visual */}
      <div className="relative rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">{t('PakFix AI Live Diagnostic', 'پاک فکس اے آئی لائیو تشخیص')}</p>
              <p className="text-[10px] text-ink-500">{t('Multimodal Instant Analysis', 'ملٹی موڈل فوری تجزیہ')}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-solid animate-pulse" />
            {t('86% Confidence', '86% اعتماد')}
          </span>
        </div>

        {/* Customer Input Preview Layer */}
        <div className="rounded-2xl border border-line bg-surface-muted/60 p-3.5 mb-4">
          <div className="flex items-start gap-3">
            <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-ink-200 border border-line">
              {/* Simulated photo visual */}
              <div className="absolute inset-0 bg-gradient-to-tr from-ink-800 to-ink-600 flex items-center justify-center text-white">
                <Wrench className="h-6 w-6 text-brand-on-dark" />
              </div>
              <span className="absolute bottom-1 end-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-solid text-[8px] text-white">
                ✓
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider">{t('Customer Upload', 'گاہک اپ لوڈ')}</span>
              <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                &ldquo;{t('Water leaking under kitchen sink pipe when faucet runs', 'نل چلنے پر کچن سنک پائپ کے نیچے پانی لیک ہو رہا ہے')}&rdquo;
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-brand-700 font-medium bg-brand-100 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3 w-3" /> {t('Photo Analyzed', 'تصویر کا تجزیہ ہو گیا')}
                </span>
                <span className="text-[11px] text-ink-500">{t('Lahore, Gulberg III', 'لاہور، گلبرگ III')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Diagnostic Output Card */}
        <div className="rounded-2xl border border-accent-600/30 bg-gradient-to-br from-accent-50/70 to-brand-50/70 p-4 mb-4 dark:from-ink-900 dark:to-ink-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-accent-600 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> {t('Likely Problem', 'غالباً مسئلہ')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700">
              <ShieldCheck className="h-3 w-3 text-brand-600" /> {t('Safe to Inspect', 'معائنہ محفوظ')}
            </span>
          </div>

          <h4 className="text-base font-bold text-foreground">{t('Loose Sink Drain Pipe & Washer Wear', 'سنک ڈرین پائپ ڈھیلا اور واشر گھسا ہوا')}</h4>
          <p className="mt-1 text-xs text-ink-600 leading-relaxed">
            {t('Minor plumbing fault. Pipe coupling loose near P-trap. No main line emergency detected.', 'معمولی پلمبنگ خرابی۔ پی ٹریپ کے قریب پائپ کپلنگ ڈھیلی ہے۔ مین لائن میں کوئی ہنگامی صورتحال نہیں۔')}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-ink-200/50 dark:border-ink-800">
            <div>
              <p className="text-[10px] text-ink-500 font-medium">{t('Estimated Repair Cost', 'متوقع مرمت لاگت')}</p>
              <p className="text-sm font-extrabold text-brand-600">{t('PKR 1,500 – 3,000', 'روپے 1,500 – 3,000')}</p>
            </div>
            <div>
              <p className="text-[10px] text-ink-500 font-medium">{t('Recommended Action', 'تجویز کردہ اقدام')}</p>
              <p className="text-xs font-bold text-foreground">{t('Book Local Plumber', 'مقامی پلمبر بک کریں')}</p>
            </div>
          </div>
        </div>

        {/* Recommended Technician Preview Card */}
        <div className="rounded-2xl border border-line bg-surface p-3.5 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                AH
              </div>
              <span className="absolute -bottom-0.5 -end-0.5 h-4 w-4 rounded-full bg-brand-solid border-2 border-white flex items-center justify-center text-[9px] text-white">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">{t('Tariq Mahmood', 'طارق محمود')}</p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-100 px-1.5 py-0.2 text-[9px] font-extrabold text-brand-700">
                  <UserCheck className="h-2.5 w-2.5 text-brand-600" /> {t('Verified', 'تصدیق شدہ')}
                </span>
              </div>
              <p className="text-[11px] text-ink-500 flex items-center gap-1">
                <span>{t('Example', 'مثال')}</span>
                <span>•</span>
                <span>{t('Gulberg, Lahore', 'گلبرگ، لاہور')}</span>
              </p>
            </div>
          </div>

          <Link
            href="/find-a-technician"
            className="inline-flex items-center gap-1 rounded-xl bg-brand-solid px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-solid-hover transition-colors shrink-0"
          >
            {t('Book Now', 'ابھی بک کریں')}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
