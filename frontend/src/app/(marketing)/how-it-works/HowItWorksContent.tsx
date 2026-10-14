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
        { en: '100% CNIC identity & criminal record verification', ur: '100% شناختی کارڈ اور مجرمانہ ریکارڈ کی تصدیق' },
        { en: 'Real customer ratings & completed job history', ur: 'حقیقی گاہک ریٹنگز اور مکمل شدہ کاموں کی تاریخ' },
        { en: 'Licensed plumbers, electricians, AC & appliance specialists', ur: 'لائسنس یافتہ پلمبر، الیکٹریشن، اے سی اور آلات کے ماہرین' },
      ],
    },
    {
      num: '04',
      icon: CheckCircle2,
      title: { en: '4. Get It Fixed & Track Work', ur: '4. کام کروائیں اور ٹریک کریں' },
      desc: {
        en: 'Track arrival times in real time, inspect the completed job, pay via cash or digital transfer, and save repair history.',
        ur: 'حقیقی وقت میں آمد کے اوقات ٹریک کریں، مکمل شدہ کام کا معائنہ کریں، نقد یا ڈیجیٹل ٹرانسفر سے ادائیگی کریں، اور مرمت کی تاریخ محفوظ رکھیں۔',
      },
      details: [
        { en: 'Real-time job tracking and arrival updates', ur: 'حقیقی وقت میں جاب ٹریکنگ اور آمد کی اپڈیٹس' },
        { en: 'Cash, JazzCash, EasyPaisa or card payments', ur: 'نقد، جاز کیش، ایزی پیسہ یا کارڈ ادائیگیاں' },
        { en: 'Lifetime digital repair history for your property', ur: 'آپ کی جائیداد کے لیے تاحیات ڈیجیٹل مرمت کی تاریخ' },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('How It Works', 'کیسے کام کرتا ہے') }]}
        eyebrow={
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-[#00824A]" />
            {t('Simple 4-Step Process', 'آسان 4 مرحلوں کا عمل')}
          </div>
        }
        title={t('How PakFix Works', 'پاک فکس کیسے کام کرتا ہے')}
        subtitle={t('From problem diagnosis to completed job. We take the guesswork, hassle, and unfair pricing out of home repairs.', 'مسئلے کی تشخیص سے کام مکمل ہونے تک۔ ہم گھریلو مرمت سے اندازہ، جھنجھٹ اور غیر منصفانہ قیمت ختم کر دیتے ہیں۔')}
      />

      {/* Main Steps Timeline */}
      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="space-y-16">
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
                    <span className="text-3xl font-extrabold text-[#00824A] tracking-wider">
                      {step.num}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#161616]">
                      {t(step.title.en, step.title.ur)}
                    </h2>
                    <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
                      {t(step.desc.en, step.desc.ur)}
                    </p>

                    <ul className="space-y-2.5 pt-2">
                      {step.details.map((detail) => (
                        <li key={detail.en} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#161616]">
                          <CheckCircle2 className="h-4 w-4 text-[#00824A] shrink-0" />
                          <span>{t(detail.en, detail.ur)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`lg:col-span-6 ${isEven ? 'lg:order-1' : ''}`}>
                    <div className="bg-[#F8FAF9] rounded-3xl p-8 border border-[#E5E7EB] shadow-card space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F0] text-[#00532C]">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#006838] border border-[#E5E7EB]">
                          {t('PakFix Standard', 'پاک فکس معیار')}
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] leading-relaxed">
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

      {/* Trust & Guarantee Banner */}
      <section className="py-12 bg-[#EAF7F0] border-t border-b border-[#E5E7EB]">
        <Container>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-2">
              <ShieldCheck className="h-8 w-8 text-[#00824A] mx-auto" />
              <h3 className="text-sm font-bold text-[#161616]">{t('Verified Technicians', 'تصدیق شدہ ٹیکنیشن')}</h3>
              <p className="text-xs text-[#667085]">{t('CNIC checked, background audited & skilled.', 'شناختی کارڈ جانچا گیا، پس منظر آڈٹ شدہ اور ہنرمند۔')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-2">
              <Sparkles className="h-8 w-8 text-[#00824A] mx-auto" />
              <h3 className="text-sm font-bold text-[#161616]">{t('AI Safety Audit', 'اے آئی حفاظتی آڈٹ')}</h3>
              <p className="text-xs text-[#667085]">{t('Checks for gas, electrical & high-risk hazards.', 'گیس، بجلی اور زیادہ خطرے کے امور کی جانچ۔')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-2">
              <PhoneCall className="h-8 w-8 text-[#00824A] mx-auto" />
              <h3 className="text-sm font-bold text-[#161616]">{t('24/7 Customer Care', '24/7 گاہک کی دیکھ بھال')}</h3>
              <p className="text-xs text-[#667085]">{t('Live phone and WhatsApp support across Pakistan.', 'پورے پاکستان میں لائیو فون اور واٹس ایپ معاونت۔')}</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all"
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
