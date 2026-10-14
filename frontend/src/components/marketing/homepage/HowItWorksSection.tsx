'use client';

import { MessageSquareText, SlidersHorizontal, UserCheck, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function HowItWorksSection() {
  const t = useT();
  const steps = [
    {
      num: '01',
      icon: MessageSquareText,
      en: "Tell Us What's Wrong",
      ur: 'ہمیں بتائیں کیا مسئلہ ہے',
      den: 'Describe the issue using simple text, upload a photo or video, or use PakFix AI diagnosis.',
      dur: 'سادہ الفاظ میں مسئلہ بیان کریں، تصویر یا ویڈیو اپلوڈ کریں، یا پاک فکس اے آئی تشخیص استعمال کریں۔',
    },
    {
      num: '02',
      icon: SlidersHorizontal,
      en: 'Choose How to Proceed',
      ur: 'آگے بڑھنے کا طریقہ منتخب کریں',
      den: 'Review AI cost estimate in PKR, request quotes from multiple pros, or book a service directly.',
      dur: 'روپے میں اے آئی لاگت کا تخمینہ دیکھیں، متعدد پروفیشنلز سے تخمینے طلب کریں، یا براہِ راست سروس بک کریں۔',
    },
    {
      num: '03',
      icon: UserCheck,
      en: 'Connect With a Professional',
      ur: 'پروفیشنل سے رابطہ کریں',
      den: 'Match with top-rated, identity-verified local technicians in your city.',
      dur: 'اپنے شہر میں اعلیٰ درجہ بندی والے، شناخت سے تصدیق شدہ مقامی ٹیکنیشنز سے میچ کریں۔',
    },
    {
      num: '04',
      icon: CheckCircle2,
      en: 'Get It Fixed & Track',
      ur: 'ٹھیک کروائیں اور ٹریک کریں',
      den: 'Track arrival in real time, inspect the work, pay securely, and store repair history.',
      dur: 'حقیقی وقت میں آمد ٹریک کریں، کام کا معائنہ کریں، محفوظ ادائیگی کریں، اور مرمت کی تاریخ محفوظ کریں۔',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Simple Process', 'آسان طریقہ')}</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            {t('From problem to fixed.', 'مسئلے سے حل تک۔')}
          </h2>
          <p className="text-sm text-[#475467]">
            {t('Four easy steps to get any home repair done with complete transparency and trust.', 'مکمل شفافیت اور اعتماد کے ساتھ کوئی بھی گھریلو مرمت کرانے کے چار آسان مراحل۔')}
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-2xs relative flex flex-col justify-between group hover:border-[#00824A] hover:shadow-card transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF7F0] text-[#00532C] group-hover:bg-[#00824A] group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-extrabold text-[#8A93A6] group-hover:text-[#00824A] transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#161616] mb-2">{t(step.en, step.ur)}</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">{t(step.den, step.dur)}</p>
                </div>

                {idx < 3 ? (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="h-6 w-6 rounded-full bg-white border border-[#E5E7EB] text-[#00824A] flex items-center justify-center text-xs font-bold shadow-2xs">
                      &rarr;
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
