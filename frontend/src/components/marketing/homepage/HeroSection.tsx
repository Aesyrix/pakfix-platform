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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const quickExamples = [
    { en: 'Tap is leaking in bathroom', ur: 'باتھ روم میں نل سے پانی ٹپک رہا ہے' },
    { en: 'AC is running but not cooling', ur: 'اے سی چل رہا ہے مگر ٹھنڈا نہیں کر رہا' },
    { en: 'Washing machine making loud noise', ur: 'واشنگ مشین زور سے آواز کر رہی ہے' },
    { en: 'Power keeps tripping constantly', ur: 'بجلی بار بار ٹرپ ہو رہی ہے' },
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
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white py-10 lg:py-16 border-b border-line">
      {/* Soft brand glow and dot grid behind the hero; purely decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -top-24 right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-accent-100/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-ink-200)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] opacity-60" />
      </div>
      <Container className="relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT SIDE: Hero Content & AI Input Box */}
          <div className="lg:col-span-7 space-y-6">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-brand-700 text-xs font-bold shadow-2xs">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span>{t('AI-powered home repair assistance', 'اے آئی سے چلنے والی گھریلو مرمت معاونت')}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink-900 tracking-tight leading-[1.15]">
              {t('Show the Problem.', 'مسئلہ دکھائیں۔')}<br />
              <span className="text-brand-600">{t('PakFix Helps You Fix It.', 'پاک فکس اسے ٹھیک کرنے میں مدد کرتا ہے۔')}</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-xl">
              {t(
                'Describe the issue, upload a photo or video, and PakFix can help identify the problem and connect you with a trusted local professional.',
                'مسئلہ بیان کریں، تصویر یا ویڈیو اپلوڈ کریں، اور پاک فکس مسئلے کی نشاندہی کر کے آپ کو قابلِ اعتماد مقامی پروفیشنل سے جوڑنے میں مدد کرتا ہے۔'
              )}
            </p>

            {/* MAIN AI PROBLEM CARD */}
            <div className="bg-white rounded-2xl border border-line p-5 sm:p-6 shadow-card space-y-4 relative">
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

              {/* File Attachment Pill Preview */}
              {selectedFile ? (
                <div className="flex items-center justify-between bg-brand-100 px-3 py-1.5 rounded-lg text-xs text-brand-700">
                  <span className="truncate max-w-[200px] font-medium">{t('Attached:', 'منسلک:')} {selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-danger-700 font-bold hover:underline cursor-pointer"
                  >
                    {t('Remove', 'ہٹائیں')}
                  </button>
                </div>
              ) : null}

              {/* Input Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Media Actions */}
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted border border-line text-xs font-semibold text-ink-600 hover:bg-brand-100 hover:text-brand-700 transition-colors cursor-pointer">
                    <Camera className="h-3.5 w-3.5 text-brand-600" />
                    <span>{t('Camera', 'کیمرہ')}</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                  </label>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted border border-line text-xs font-semibold text-ink-600 hover:bg-brand-100 hover:text-brand-700 transition-colors cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-brand-600" />
                    <span>{t('Upload Photo', 'تصویر اپلوڈ کریں')}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted border border-line text-xs font-semibold text-ink-600 hover:bg-brand-100 hover:text-brand-700 transition-colors cursor-pointer hidden sm:inline-flex">
                    <Video className="h-3.5 w-3.5 text-accent-600" />
                    <span>{t('Upload Video', 'ویڈیو اپلوڈ کریں')}</span>
                    <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={() => setProblemText((prev) => prev + t(' [Voice note recorded]', ' [وائس نوٹ ریکارڈ ہوا]'))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted border border-line text-xs font-semibold text-ink-600 hover:bg-brand-100 hover:text-brand-700 transition-colors cursor-pointer hidden sm:inline-flex"
                  >
                    <Mic className="h-3.5 w-3.5 text-brand-600" />
                    <span>{t('Voice', 'آواز')}</span>
                  </button>
                </div>

                {/* Primary CTA Button */}
                <Link
                  href={{ pathname: '/ai', query: { text: problemText } }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md transition-all group"
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
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-brand-600/20 p-5 shadow-floating relative overflow-hidden">
              {/* Header Bar inside preview */}
              <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-600 animate-ping" />
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
                  {t('Photo Analyzed', 'تصویر کا تجزیہ ہو گیا')}
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
                  <span className="font-extrabold text-brand-600">{t('95% High Confidence', '95% زیادہ اعتماد')}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                  <span className="text-ink-500">{t('Safety Risk:', 'حفاظتی خطرہ:')}</span>
                  <span className="font-bold text-brand-600 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t('Low Risk (Generally Safe)', 'کم خطرہ (عام طور پر محفوظ)')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-brand-100">
                  <span className="text-brand-700 font-semibold">{t('Estimated Repair:', 'تخمینی مرمت:')}</span>
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
                  className="inline-flex items-center justify-center text-xs font-bold py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-xs"
                >
                  {t('Book Plumber', 'پلمبر بک کریں')}
                </Link>
              </div>

              {/* Verified Technician Badge Card Underneath */}
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                    PF
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-ink-900">{t('Verified professional', 'تصدیق شدہ پروفیشنل')}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 fill-brand-600" />
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
