'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MessageSquare, Camera, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT, useLocale } from '@/components/i18n/LocaleProvider';

export function AiAssistantFeatureSection() {
  const t = useT();
  const { locale } = useLocale();
  const [activeQuery, setActiveQuery] = useState('fridge');

  const demoResults = {
    fridge: {
      query: 'My refrigerator is making a clicking sound every few minutes.',
      queryUr: 'میرا فریج ہر چند منٹ بعد کلک کی آواز کر رہا ہے۔',
      causes: ['Compressor start relay failure', 'Voltage stabilizer fluctuation', 'Condenser coil overheating'],
      causesUr: ['کمپریسر اسٹارٹ ریلے کی خرابی', 'وولٹیج سٹیبلائزر میں اتار چڑھاؤ', 'کونڈینسر کوائل زیادہ گرم ہونا'],
      risk: 'Medium Risk',
      riskUr: 'درمیانہ خطرہ',
      diy: 'Basic plug/voltage check only',
      diyUr: 'صرف بنیادی پلگ/وولٹیج چیک',
      pro: 'Appliance Technician',
      proUr: 'آلات ٹیکنیشن',
      estimate: 'PKR 2,500 – 7,500',
    },
    ac: {
      query: 'Water is dripping from the indoor unit of my split AC.',
      queryUr: 'میرے اسپلٹ اے سی کے اندرونی یونٹ سے پانی ٹپک رہا ہے۔',
      causes: ['Clogged condensate drain line', 'Frozen evaporator coils', 'Incorrect indoor unit tilt'],
      causesUr: ['بند کنڈینسیٹ ڈرین لائن', 'جمی ہوئی ایویپوریٹر کوائلز', 'اندرونی یونٹ کا غلط جھکاؤ'],
      risk: 'Low Risk',
      riskUr: 'کم خطرہ',
      diy: 'Clear visible drain pipe obstruction',
      diyUr: 'نظر آنے والی ڈرین پائپ رکاوٹ صاف کریں',
      pro: 'AC Service Specialist',
      proUr: 'اے سی سروس اسپیشلسٹ',
      estimate: 'PKR 1,500 – 3,500',
    },
    water: {
      query: 'Water motor turns on but no water reaches the overhead tank.',
      queryUr: 'واٹر موٹر چلتی ہے مگر اوپر والی ٹنکی تک پانی نہیں پہنچتا۔',
      causes: ['Air lock in suction line', 'Worn out impeller seal', 'Low main water supply pressure'],
      causesUr: ['سکشن لائن میں ایئر لاک', 'گھسا ہوا امپیلر سیل', 'مین واٹر سپلائی کا کم دباؤ'],
      risk: 'Low-Medium Risk',
      riskUr: 'کم تا درمیانہ خطرہ',
      diy: 'Check foot valve and prime pump',
      diyUr: 'فٹ والو چیک کریں اور پمپ پرائم کریں',
      pro: 'Plumber / Motor Technician',
      proUr: 'پلمبر / موٹر ٹیکنیشن',
      estimate: 'PKR 2,000 – 5,000',
    },
  };

  const current = demoResults[activeQuery as keyof typeof demoResults];
  const isUr = locale === 'ur';
  const causes = isUr ? current.causesUr : current.causes;

  return (
    <section className="py-16 sm:py-24 bg-[#EAF7F0] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#006838] text-xs font-bold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#00824A]" />
            {t('Smart AI Repair Guidance', 'سمارٹ اے آئی مرمت رہنمائی')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            {t("Not sure what's wrong?", 'سمجھ نہیں آ رہا کیا مسئلہ ہے؟')}<br />
            <span className="text-[#00824A]">{t('Ask PakFix AI.', 'پاک فکس اے آئی سے پوچھیں۔')}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#475467]">
            {t('Describe the symptoms or upload photos. PakFix AI evaluates safety risks, predicts estimated repair costs in PKR, and connects you to the right local professional.', 'علامات بیان کریں یا تصاویر اپلوڈ کریں۔ پاک فکس اے آئی حفاظتی خطرات جانچتا ہے، روپے میں مرمت کی تخمینی لاگت بتاتا ہے، اور آپ کو صحیح مقامی پروفیشنل سے جوڑتا ہے۔')}
          </p>
        </div>

        {/* 3 Input Method Pill Headers */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#EAF7F0] text-[#00532C] font-bold flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#161616]">{t('1. Describe It', '١. بیان کریں')}</h3>
              <p className="text-xs text-[#667085] mt-0.5">{t('Tell PakFix what happened in English or Roman Urdu.', 'پاک فکس کو انگریزی یا رومن اردو میں بتائیں کیا ہوا۔')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#DBEAFE] text-[#2563EB] font-bold flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#161616]">{t('2. Show It', '٢. دکھائیں')}</h3>
              <p className="text-xs text-[#667085] mt-0.5">{t('Upload photos or short video clips of the issue.', 'مسئلے کی تصاویر یا مختصر ویڈیو کلپس اپلوڈ کریں۔')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#EAF7F0] text-[#00532C] font-bold flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#161616]">{t('3. Get Guidance', '٣. رہنمائی حاصل کریں')}</h3>
              <p className="text-xs text-[#667085] mt-0.5">{t('Receive safety level, PKR cost estimate & matching pro.', 'حفاظتی سطح، روپے میں لاگت کا تخمینہ اور موزوں پروفیشنل حاصل کریں۔')}</p>
            </div>
          </div>
        </div>

        {/* Interactive Demo Interface */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-card p-6 lg:p-8">
          {/* Query Preset Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#E5E7EB] pb-4">
            <span className="text-xs font-bold text-[#667085] me-2">{t('Try interactive sample:', 'انٹرایکٹو نمونہ آزمائیں:')}</span>
            <button
              type="button"
              onClick={() => setActiveQuery('fridge')}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeQuery === 'fridge'
                  ? 'bg-[#00824A] text-white'
                  : 'bg-[#F8FAF9] text-[#475467] hover:bg-[#EAF7F0]'
              }`}
            >
              {t('Fridge Clicking', 'فریج کی کلک آواز')}
            </button>
            <button
              type="button"
              onClick={() => setActiveQuery('ac')}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeQuery === 'ac'
                  ? 'bg-[#00824A] text-white'
                  : 'bg-[#F8FAF9] text-[#475467] hover:bg-[#EAF7F0]'
              }`}
            >
              {t('AC Water Dripping', 'اے سی سے پانی ٹپکنا')}
            </button>
            <button
              type="button"
              onClick={() => setActiveQuery('water')}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeQuery === 'water'
                  ? 'bg-[#00824A] text-white'
                  : 'bg-[#F8FAF9] text-[#475467] hover:bg-[#EAF7F0]'
              }`}
            >
              {t('Water Pump Issue', 'واٹر پمپ مسئلہ')}
            </button>
          </div>

          {/* Prompt Display */}
          <div className="bg-[#F8FAF9] rounded-xl p-3.5 border border-[#E5E7EB] text-sm text-[#161616] mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#667085] block">{t('Customer Prompt:', 'گاہک کا پیغام:')}</span>
              <span className="font-semibold text-[#161616]">&quot;{isUr ? current.queryUr : current.query}&quot;</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 rounded bg-[#EAF7F0] text-[#006838]">
              {t('Verified AI Output', 'تصدیق شدہ اے آئی نتیجہ')}
            </span>
          </div>

          {/* AI Result Card Layout */}
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#667085]">{t('Possible Causes:', 'ممکنہ وجوہات:')}</h4>
              <ul className="space-y-2">
                {causes.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-xs font-semibold text-[#161616]">
                    <CheckCircle className="h-4 w-4 text-[#00824A]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F8FAF9] p-4 rounded-xl space-y-2.5 border border-[#E5E7EB] text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">{t('Risk Level:', 'خطرے کی سطح:')}</span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {isUr ? current.riskUr : current.risk}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">{t('Safe DIY Action:', 'محفوظ خود کرنے کا عمل:')}</span>
                <span className="font-semibold text-[#161616]">{isUr ? current.diyUr : current.diy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">{t('Recommended Service:', 'تجویز کردہ سروس:')}</span>
                <span className="font-bold text-[#00824A]">{isUr ? current.proUr : current.pro}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
                <span className="text-[#006838] font-bold">{t('Estimated Cost:', 'تخمینی لاگت:')}</span>
                <span className="font-extrabold text-sm text-[#006838]">{current.estimate}</span>
              </div>
            </div>
          </div>

          {/* CTA Bar */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="text-xs text-[#667085]">{t('Have a real home issue right now?', 'کیا ابھی کوئی حقیقی گھریلو مسئلہ ہے؟')}</span>
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>{t('Try PakFix AI Free', 'پاک فکس اے آئی مفت آزمائیں')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
