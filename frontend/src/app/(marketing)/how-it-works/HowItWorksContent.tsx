'use client';

import Link from 'next/link';
import {
  Sparkles,
  MessageSquareText,
  SlidersHorizontal,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function HowItWorksContent() {
  const t = useT();
  const steps = [
    {
      num: '01',
      icon: MessageSquareText,
      title: { en: "1. Tell Us What's Wrong", ur: '1. بتائیں کیا خراب ہے' },
      desc: {
        en: 'Type a brief description of the problem, upload photos or video, or use PakFix AI to check safety hazards and causes automatically.',
        ur: 'مسئلے کی مختصر تفصیل لکھیں، تصاویر یا ویڈیو اپ لوڈ کریں، یا پاک فکس اے آئی سے خودکار طور پر حفاظتی خطرات اور وجوہات چیک کروائیں۔',
      },
      details: [
        { en: 'Voice dictation in English or Roman Urdu', ur: 'انگریزی یا رومن اردو میں آواز سے تحریر' },
        { en: 'Photo & video diagnostic upload', ur: 'تصویر اور ویڈیو تشخیصی اپ لوڈ' },
        { en: 'Automatic safety hazard assessment', ur: 'خودکار حفاظتی خطرے کی جانچ' },
      ],
    },
    {
      num: '02',
      icon: SlidersHorizontal,
      title: { en: '2. Compare Quotes & Prices', ur: '2. کوٹیشن اور قیمتوں کا موازنہ کریں' },
      desc: {
        en: 'Receive upfront PKR price ranges for labour and materials. Compare multiple itemized quotes side by side before scheduling.',
        ur: 'مزدوری اور سامان کے لیے پیشگی روپے قیمت کی حدود حاصل کریں۔ شیڈول کرنے سے پہلے متعدد تفصیلی کوٹیشنز کا ساتھ ساتھ موازنہ کریں۔',
      },
      details: [
        { en: 'Transparent labor and material cost estimates', ur: 'شفاف مزدوری اور سامان لاگت کا تخمینہ' },
        { en: 'No hidden surprise fees on site', ur: 'موقع پر کوئی چھپی حیران کن فیس نہیں' },
        { en: 'Side-by-side technician quote comparison', ur: 'ٹیکنیشن کوٹیشن کا ساتھ ساتھ موازنہ' },
      ],
    },
    {
      num: '03',
      icon: UserCheck,
      title: { en: '3. Match With Verified Professionals', ur: '3. تصدیق شدہ پروفیشنلز سے میچ ہوں' },
      desc: {
        en: 'PakFix matches your job with top-rated, identity-checked local technicians in your city.',
        ur: 'پاک فکس آپ کے کام کو آپ کے شہر کے اعلیٰ درجہ بند، شناخت جانچے گئے مقامی ٹیکنیشنز سے میچ کرتا ہے۔',
      },
      details: [
        { en: 'CNIC and selfie reviewed by our team', ur: 'شناختی کارڈ اور سیلفی کی جانچ ہماری ٹیم کرتی ہے' },
        { en: 'Real customer ratings & completed job history', ur: 'حقیقی گاہک ریٹنگز اور مکمل شدہ کاموں کی تاریخ' },
        { en: 'Plumbers, electricians, AC and appliance specialists', ur: 'پلمبر، الیکٹریشن، اے سی اور آلات کے ماہرین' },
      ],
    },
    {
      num: '04',
      icon: CheckCircle2,
      title: { en: '4. Get It Fixed & Track Work', ur: '4. کام کروائیں اور ٹریک کریں' },
      desc: {
        en: 'Follow each step of the job, check the finished work, pay in cash, and keep your job history.',
        ur: 'کام کا ہر مرحلہ دیکھیں، مکمل کام چیک کریں، نقد ادائیگی کریں اور اپنے کاموں کی تاریخ رکھیں۔',
      },
      details: [
        { en: 'Real-time job tracking and arrival updates', ur: 'حقیقی وقت میں جاب ٹریکنگ اور آمد کی اپڈیٹس' },
        { en: 'Pay cash once you confirm the job is done', ur: 'کام کی تصدیق کے بعد نقد ادائیگی' },
        { en: 'Your job history in one place', ur: 'آپ کے کاموں کی تاریخ ایک جگہ' },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('How It Works', 'کیسے کام کرتا ہے') }]}
        eyebrow={
          <span className="eyebrow">{t('Simple 4-Step Process', 'آسان 4 مرحلوں کا عمل')}</span>
        }
        title={t('How PakFix Works', 'پاک فکس کیسے کام کرتا ہے')}
        subtitle={t('From problem diagnosis to completed job. We take the guesswork, hassle, and unfair pricing out of repairs.', 'مسئلے کی تشخیص سے کام مکمل ہونے تک۔ ہم مرمت سے اندازہ، جھنجھٹ اور غیر منصفانہ قیمت ختم کر دیتے ہیں۔')}
      />

      {/* Main Steps Timeline */}
      <section className="py-16 sm:py-24 bg-surface">
        <Container>
          <div className="space-y-20 sm:space-y-28">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 1;
              return (
                <div
                  key={step.num}
                  className={`grid lg:grid-cols-12 gap-8 items-center ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className={`lg:col-span-6 space-y-4 ${isEven ? 'lg:order-2' : ''}`}>
                    <span className="text-gradient-brand block font-display text-6xl font-bold leading-none tracking-[-0.04em] tabular-nums">
                      {step.num}
                    </span>
                    <h2 className="section-title text-ink-900">
                      {t(step.title.en, step.title.ur)}
                    </h2>
                    <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
                      {t(step.desc.en, step.desc.ur)}
                    </p>

                    <ul className="space-y-2.5 pt-2">
                      {step.details.map((detail) => (
                        <li key={detail.en} className="flex items-center gap-3 text-sm font-medium text-ink-900">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /></span>
                          <span>{t(detail.en, detail.ur)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`lg:col-span-6 ${isEven ? 'lg:order-1' : ''}`}>
                    <div className="card-lift relative isolate overflow-hidden bg-brand-glow rounded-3xl p-8 sm:p-10 border border-brand-200/70 shadow-lifted space-y-6">
                      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-brand-200)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)] opacity-60" />
                      <div className="flex items-center justify-between">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25">
                          <Icon className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <span className="eyebrow !mb-0">
                          {t('PakFix Standard', 'پاک فکس معیار')}
                        </span>
                      </div>
                      <p className="text-sm text-ink-600 leading-relaxed">
                        {t('Every step is backed by identity verification, automated price guidelines, and real-time support.', 'ہر مرحلہ شناخت کی تصدیق، خودکار قیمت کے رہنما اصولوں اور حقیقی وقت کی معاونت سے مضبوط ہے۔')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Trust banner */}
      <section className="py-16 sm:py-24 bg-section-glow">
        <Container>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="card-lift bg-surface p-7 rounded-2xl border border-line shadow-xs space-y-3">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="font-display text-base font-bold text-ink-900">{t('Verified Technicians', 'تصدیق شدہ ٹیکنیشن')}</h3>
              <p className="text-sm text-ink-500">{t('CNIC and selfie checked by our team.', 'شناختی کارڈ اور سیلفی کی جانچ ہماری ٹیم کرتی ہے۔')}</p>
            </div>
            <div className="card-lift bg-surface p-7 rounded-2xl border border-line shadow-xs space-y-3">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100"><Sparkles className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="font-display text-base font-bold text-ink-900">{t('AI Safety Audit', 'اے آئی حفاظتی آڈٹ')}</h3>
              <p className="text-sm text-ink-500">{t('Checks for gas, electrical & high-risk hazards.', 'گیس، بجلی اور زیادہ خطرے کے امور کی جانچ۔')}</p>
            </div>
            <div className="card-lift bg-surface p-7 rounded-2xl border border-line shadow-xs space-y-3">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100"><PhoneCall className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="font-display text-base font-bold text-ink-900">{t('Help When You Need It', 'جب ضرورت ہو مدد')}</h3>
              <p className="text-sm text-ink-500">{t('Message our support team any time.', 'ہماری سپورٹ ٹیم کو کسی بھی وقت پیغام بھیجیں۔')}</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/ai"
              className="inline-flex min-h-12 items-center gap-2 px-8 rounded-[var(--radius-button)] bg-brand-solid hover:bg-brand-solid-hover text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5"
            >
              <span>{t('Try AI Diagnosis Now', 'ابھی اے آئی تشخیص آزمائیں')}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
