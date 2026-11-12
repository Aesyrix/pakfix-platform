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
      den: 'Describe the issue in simple words, or ask PakFix AI first.',
      dur: 'سادہ الفاظ میں مسئلہ بیان کریں، یا پہلے پاک فکس اے آئی سے پوچھیں۔',
    },
    {
      num: '02',
      icon: SlidersHorizontal,
      en: 'Choose How to Proceed',
      ur: 'آگے بڑھنے کا طریقہ منتخب کریں',
      den: 'Post your job, name your price if you like, and get offers from several pros.',
      dur: 'اپنا کام پوسٹ کریں، چاہیں تو اپنی قیمت بتائیں، اور کئی پروفیشنلز سے آفرز لیں۔',
    },
    {
      num: '03',
      icon: UserCheck,
      en: 'Connect With a Professional',
      ur: 'پروفیشنل سے رابطہ کریں',
      den: 'Compare identity-verified pros near you, with their ratings and reviews.',
      dur: 'قریبی شناخت شدہ پروفیشنلز کا ان کی ریٹنگ اور ریویوز کے ساتھ موازنہ کریں۔',
    },
    {
      num: '04',
      icon: CheckCircle2,
      en: 'Get It Fixed & Track',
      ur: 'ٹھیک کروائیں اور ٹریک کریں',
      den: 'Follow the job step by step, check the work, then pay in cash and leave a review.',
      dur: 'کام قدم بہ قدم دیکھیں، کام چیک کریں، پھر نقد ادائیگی کریں اور ریویو دیں۔',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-section-glow">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="eyebrow">{t('Simple Process', 'آسان طریقہ')}</span>
          <h2 className="section-title text-ink-900">
            {t('From problem to fixed.', 'مسئلے سے حل تک۔')}
          </h2>
          <p className="text-sm text-ink-600">
            {t('Four easy steps to get any repair done with complete transparency and trust.', 'مکمل شفافیت اور اعتماد کے ساتھ کوئی بھی مرمت کرانے کے چار آسان مراحل۔')}
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="card-lift bg-surface rounded-2xl p-6 border border-line shadow-xs relative flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-800 group-hover:bg-brand-solid group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-gradient-brand font-display text-3xl font-bold tabular-nums opacity-50 transition-opacity group-hover:opacity-100">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-ink-900 mb-2">{t(step.en, step.ur)}</h3>
                  <p className="text-xs text-ink-500 leading-relaxed">{t(step.den, step.dur)}</p>
                </div>

                {idx < 3 ? (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div aria-hidden="true" className="h-6 w-6 rounded-full bg-surface border border-line text-brand-600 flex items-center justify-center text-xs font-bold shadow-xs rtl:-scale-x-100">
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
