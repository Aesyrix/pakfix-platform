'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, FileText, UserCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function AiToProHandoffSection() {
  const t = useT();
  const steps = [
    { en: '1. Describe it', ur: '١. مسئلہ بیان کریں', den: 'PakFix AI reads your description and checks for danger', dur: 'پاک فکس اے آئی آپ کی تفصیل پڑھ کر خطرہ دیکھتا ہے', icon: Sparkles },
    { en: '2. Recommended Service', ur: '٢. تجویز کردہ سروس', den: 'Suggests the service you need', dur: 'آپ کو درکار سروس تجویز کرتا ہے', icon: ShieldCheck },
    { en: '3. Post your job', ur: '٣. اپنا کام پوسٹ کریں', den: 'Your description comes with you, no retyping', dur: 'آپ کی تفصیل ساتھ جاتی ہے، دوبارہ لکھنے کی ضرورت نہیں', icon: FileText },
    { en: '4. Choose an offer', ur: '٤. آفر منتخب کریں', den: 'Pick a verified pro and follow the job step by step', dur: 'تصدیق شدہ پروفیشنل منتخب کریں اور کام قدم بہ قدم دیکھیں', icon: UserCheck },
  ];

  return (
    <section className="py-16 sm:py-24 bg-surface">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="eyebrow">{t('Seamless Handoff', 'بے رکاوٹ منتقلی')}</span>
          <h2 className="section-title text-ink-900">
            {t('From AI diagnosis to job completed.', 'اے آئی تشخیص سے کام مکمل ہونے تک۔')}<br />
            <span className="text-gradient-brand">{t('Zero repetitive typing.', 'دوبارہ لکھنے کی ضرورت نہیں۔')}</span>
          </h2>
          <p className="text-sm text-ink-600">
            {t('When you ask PakFix AI in the app, your description and the suggested service carry straight into your job post.', 'جب آپ ایپ میں پاک فکس اے آئی سے پوچھتے ہیں تو آپ کی تفصیل اور تجویز کردہ سروس سیدھا آپ کی جاب پوسٹ میں آ جاتی ہے۔')}
          </p>
        </div>

        {/* 4 Steps Flow */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.en}
                className="card-lift bg-surface rounded-2xl p-5 border border-line shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-ink-900">{t(step.en, step.ur)}</h3>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed">{t(step.den, step.dur)}</p>
                </div>

                {index < 3 ? (
                  <div aria-hidden="true" className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-xs font-bold text-brand-600 shadow-xs rtl:-scale-x-100">
                    &rarr;
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
