'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';
import { HERO_IMAGE } from '@/lib/images';

export function HeroSection() {
  const t = useT();
  const [problemText, setProblemText] = useState('');

  const quickExamples = [
    { en: 'Tap is leaking in bathroom', ur: 'باتھ روم میں نل سے پانی ٹپک رہا ہے' },
    { en: 'AC is running but not cooling', ur: 'اے سی چل رہا ہے مگر ٹھنڈا نہیں کر رہا' },
    { en: 'Car battery is dead, need a jump start', ur: 'گاڑی کی بیٹری ختم ہو گئی، جمپ سٹارٹ چاہیے' },
    { en: 'Power keeps tripping constantly', ur: 'بجلی بار بار ٹرپ ہو رہی ہے' },
  ];

  const handleExampleClick = (example: string) => {
    setProblemText(example);
  };

  return (
    <section data-no-reveal className="relative isolate overflow-hidden bg-premium-dark py-14 lg:py-24 text-white">
      {/* Grid lines, an aqua glow behind the headline and a coral glow behind the card; purely decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-dark" />
        <div className="anim-drift absolute -left-24 top-[12%] h-[26rem] w-[34rem] rounded-full bg-brand-400/35 blur-[120px]" />
        <div className="anim-drift-slow absolute right-[4%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-glow-warm/35 blur-[120px]" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-[30rem] rounded-full bg-brand-500/30 blur-[110px]" />
      </div>
      <Container className="relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT SIDE: Hero Content & AI Input Box */}
          <div className="lg:col-span-7 space-y-6">
            {/* Trust Pill */}
            <div className="anim-rise inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/[0.06] border border-white/15 text-brand-on-dark text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>{t('AI-powered repair assistance', 'اے آئی سے چلنے والی مرمت معاونت')}</span>
            </div>

            {/* Main Heading */}
            <h1 className="anim-rise text-4xl sm:text-5xl lg:text-[3.3rem] font-bold text-white tracking-[-0.025em] leading-[1.06]" style={{ '--d': '90ms' } as React.CSSProperties}>
              {t('Tell Us the Problem.', 'مسئلہ بتائیں۔')}<br />
              <span className="text-gradient-on-dark">{t('PakFix Helps You Fix It.', 'پاک فکس اسے ٹھیک کرنے میں مدد کرتا ہے۔')}</span>
            </h1>

            {/* Subheading */}
            <p className="anim-rise text-base sm:text-lg text-ink-300 leading-relaxed max-w-xl" style={{ '--d': '180ms' } as React.CSSProperties}>
              {t(
                'Describe the issue in your own words. PakFix AI suggests what it could be and what to do safely, then verified pros near you send offers.',
                'مسئلہ اپنے الفاظ میں بیان کریں۔ پاک فکس اے آئی بتاتا ہے کہ مسئلہ کیا ہو سکتا ہے اور محفوظ طریقے سے کیا کریں، پھر قریبی تصدیق شدہ پروفیشنلز آفرز بھیجتے ہیں۔'
              )}
            </p>

            {/* MAIN AI PROBLEM CARD */}
            <div className="anim-rise bg-surface text-ink-900 rounded-2xl p-5 sm:p-6 shadow-2xl ring-1 ring-surface/20 space-y-4 relative" style={{ '--d': '280ms' } as React.CSSProperties}>
              <div className="flex items-center justify-between">
                <label htmlFor="ai-problem-input" className="text-sm font-bold text-ink-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                  {t('What needs fixing?', 'کیا ٹھیک کرنا ہے؟')}
                </label>
                <span className="text-[11px] text-ink-500 font-medium">{t('Free AI Diagnosis', 'مفت اے آئی تشخیص')}</span>
              </div>

              {/* Text Area Input */}
              <div className="relative">
                <textarea
                  id="ai-problem-input"
                  rows={3}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder={t('e.g. My AC is running but not cooling, making a click sound...', 'مثلاً: میرا اے سی چل رہا ہے مگر ٹھنڈا نہیں کر رہا، کلک کی آواز آ رہی ہے...')}
                  className="w-full rounded-xl border border-line p-3.5 text-sm text-ink-900 placeholder-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Input Action Bar */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                {/* Primary CTA Button */}
                <Link
                  href={{ pathname: '/ai', query: { text: problemText } }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-solid hover:bg-brand-solid-hover text-white text-sm font-bold shadow-[var(--shadow-brand)] transition-all group"
                >
                  <span>{t('Diagnose My Problem', 'میرا مسئلہ تشخیص کریں')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Quick Problem Example Chips */}
              <div className="pt-3 border-t border-line space-y-2">
                <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">{t('Quick examples:', 'فوری مثالیں:')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickExamples.map((ex) => (
                    <button
                      key={ex.en}
                      type="button"
                      onClick={() => handleExampleClick(t(ex.en, ex.ur))}
                      className="text-xs px-2.5 py-1 rounded-lg bg-surface-muted hover:bg-brand-100 border border-line text-ink-600 hover:text-brand-700 font-medium transition-colors cursor-pointer"
                    >
                      &quot;{t(ex.en, ex.ur)}&quot;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Product UI Preview Card */}
          <div className="anim-rise lg:col-span-5 space-y-4" style={{ '--d': '380ms' } as React.CSSProperties}>
            <div className="anim-float bg-surface text-ink-900 rounded-2xl p-5 shadow-2xl ring-1 ring-surface/20 relative overflow-hidden lg:rotate-[0.6deg] transition-transform duration-500 hover:rotate-0">
              {/* Header Bar inside preview */}
              <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-solid animate-ping" />
                  <span className="text-xs font-extrabold text-ink-900 tracking-wide">{t('PAKFIX AI DIAGNOSIS', 'پاک فکس اے آئی تشخیص')}</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700">
                  {t('Example Result', 'مثالی نتیجہ')}
                </span>
              </div>

              {/* Mock Upload Image Preview */}
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-ink-100 border border-line mb-4">
                <Image
                  src={HERO_IMAGE}
                  alt={t('PakFix AI Diagnosis Demo', 'پاک فکس اے آئی تشخیص ڈیمو')}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-xs">
                  {t('Problem checked', 'مسئلہ چیک ہو گیا')}
                </div>
              </div>

              {/* AI Diagnostic Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                  <span className="text-ink-500">{t('Possible Issue:', 'ممکنہ مسئلہ:')}</span>
                  <span className="font-bold text-ink-900">{t('Loose P-Trap Connection / Seal', 'ڈھیلا پی-ٹریپ کنکشن / سیل')}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                  <span className="text-ink-500">{t('AI Confidence:', 'اے آئی اعتماد:')}</span>
                  <span className="font-extrabold text-safe-500">{t('95% High Confidence', '95% زیادہ اعتماد')}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                  <span className="text-ink-500">{t('Safety Risk:', 'حفاظتی خطرہ:')}</span>
                  <span className="font-bold text-safe-500 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t('Low Risk (Generally Safe)', 'کم خطرہ (عام طور پر محفوظ)')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-brand-100">
                  <span className="text-brand-700 font-semibold">{t('Usually:', 'عموماً:')}</span>
                  <span className="font-extrabold text-brand-700 text-sm">PKR 1,500 – 3,000</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-4">
                <Link
                  href="/ai"
                  className="inline-flex items-center justify-center text-xs font-bold py-2.5 rounded-xl border border-line text-ink-900 hover:bg-surface-muted transition-colors"
                >
                  {t('View Safe Checks', 'محفوظ طریقے دیکھیں')}
                </Link>
                <Link
                  href="/find-a-technician"
                  className="inline-flex items-center justify-center text-xs font-bold py-2.5 rounded-xl bg-brand-solid text-white hover:bg-brand-solid-hover transition-colors shadow-xs"
                >
                  {t('Get offers', 'آفرز لیں')}
                </Link>
              </div>

              {/* Verified Technician Badge Card Underneath */}
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-brand-solid text-white font-bold text-xs flex items-center justify-center">
                    PF
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-ink-900">{t('Verified professional', 'تصدیق شدہ پروفیشنل')}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 fill-brand-solid" />
                    </div>
                    <span className="text-[10px] text-ink-500">{t('Plumber', 'پلمبر')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-brand-600 font-bold">{t('Example', 'مثال')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
