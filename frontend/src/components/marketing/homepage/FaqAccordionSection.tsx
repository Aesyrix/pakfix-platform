'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function FaqAccordionSection() {
  const t = useT();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is PakFix?',
      qur: 'پاک فکس کیا ہے؟',
      a: 'PakFix connects you with verified professionals for repairs to your home, office, car, bike and gadgets. Describe the problem, get offers from pros near you, choose one and pay in cash when the work is done.',
      aur: 'پاک فکس آپ کو گھر، دفتر، گاڑی، بائیک اور آلات کی مرمت کے لیے تصدیق شدہ پروفیشنلز سے جوڑتا ہے۔ مسئلہ بیان کریں، قریبی پروفیشنلز سے آفرز لیں، ایک منتخب کریں اور کام مکمل ہونے پر نقد ادائیگی کریں۔',
    },
    {
      q: 'How does PakFix AI work?',
      qur: 'پاک فکس اے آئی کیسے کام کرتا ہے؟',
      a: 'You describe the problem in simple words, in English or Roman Urdu. PakFix AI suggests possible causes, checks for safety risks, shows the right service and its usual price range, and helps you post the job.',
      aur: 'آپ سادہ الفاظ میں، انگریزی یا رومن اردو میں مسئلہ بیان کرتے ہیں۔ پاک فکس اے آئی ممکنہ وجوہات بتاتا ہے، حفاظتی خطرات دیکھتا ہے، درست سروس اور اس کی عام قیمت دکھاتا ہے، اور کام پوسٹ کرنے میں مدد دیتا ہے۔',
    },
    {
      q: 'Is AI diagnosis a replacement for a technician?',
      qur: 'کیا اے آئی تشخیص ٹیکنیشن کا متبادل ہے؟',
      a: 'No. PakFix AI gives quick guidance only. Real repairs, especially electrical, gas or structural work, should always be checked and done by a verified professional.',
      aur: 'نہیں۔ پاک فکس اے آئی صرف فوری رہنمائی دیتا ہے۔ حقیقی مرمت، خاص طور پر بجلی، گیس یا ڈھانچے کا کام، ہمیشہ تصدیق شدہ پروفیشنل سے چیک اور مکمل کروائیں۔',
    },
    {
      q: 'Can I send photos?',
      qur: 'کیا میں تصاویر بھیج سکتا ہوں؟',
      a: 'Once a professional is booked, you can send them photos in the job chat in the app. The AI and new requests take text for now.',
      aur: 'پروفیشنل بک ہونے کے بعد آپ ایپ میں جاب چیٹ میں انہیں تصاویر بھیج سکتے ہیں۔ فی الحال اے آئی اور نئی درخواستیں صرف تحریر لیتی ہیں۔',
    },
    {
      q: 'Can I get more than one offer?',
      qur: 'کیا مجھے ایک سے زیادہ آفرز مل سکتی ہیں؟',
      a: 'Yes. Several verified pros near you can send offers showing the visit fee, labour and materials. Compare them, or name your own price, and accept the one you want.',
      aur: 'جی ہاں۔ قریبی کئی تصدیق شدہ پروفیشنلز وزٹ فیس، مزدوری اور سامان کے ساتھ آفرز بھیج سکتے ہیں۔ ان کا موازنہ کریں، یا اپنی قیمت بتائیں، اور جو چاہیں قبول کریں۔',
    },
    {
      q: 'How are professionals verified?',
      qur: 'پروفیشنلز کی تصدیق کیسے ہوتی ہے؟',
      a: 'Every professional submits their CNIC (front and back) and a selfie. Our team reviews them by hand before the professional can offer on jobs, and customers rate every completed job.',
      aur: 'ہر پروفیشنل اپنا شناختی کارڈ (دونوں طرف) اور سیلفی جمع کراتا ہے۔ آفر دینے سے پہلے ہماری ٹیم انہیں خود جانچتی ہے، اور گاہک ہر مکمل کام کی ریٹنگ دیتے ہیں۔',
    },
    {
      q: 'Which cities do you serve?',
      qur: 'آپ کون سے شہروں میں خدمات دیتے ہیں؟',
      a: 'We are starting in Islamabad and Rawalpindi, and will add more cities step by step.',
      aur: 'ہم اسلام آباد اور راولپنڈی سے آغاز کر رہے ہیں اور مرحلہ وار مزید شہر شامل کریں گے۔',
    },
    {
      q: 'How do payments work?',
      qur: 'ادائیگی کیسے ہوتی ہے؟',
      a: 'You pay the professional in cash after you confirm the job is done. Online payments are not available yet.',
      aur: 'کام مکمل ہونے کی تصدیق کے بعد آپ پروفیشنل کو نقد ادائیگی کرتے ہیں۔ آن لائن ادائیگی ابھی دستیاب نہیں۔',
    },
    {
      q: 'Can I book emergency repairs?',
      qur: 'کیا میں ہنگامی مرمت بک کر سکتا ہوں؟',
      a: 'Yes. Choose Emergency when you post a request. Nearby professionals get a shorter 15-minute window to respond.',
      aur: 'جی ہاں۔ درخواست بھیجتے وقت ایمرجنسی چنیں۔ قریبی پروفیشنلز کو جواب کے لیے 15 منٹ کا مختصر وقت ملتا ہے۔',
    },
    {
      q: 'Can I manage more than one property?',
      qur: 'کیا میں ایک سے زیادہ پراپرٹی سنبھال سکتا ہوں؟',
      a: 'Not yet. Managing several properties is planned for a later version.',
      aur: 'ابھی نہیں۔ کئی پراپرٹیز کا انتظام بعد کے ورژن میں آئے گا۔',
    },
    {
      q: 'Can professionals register with PakFix?',
      qur: 'کیا پروفیشنلز پاک فکس کے ساتھ رجسٹر ہو سکتے ہیں؟',
      a: 'Skilled technicians and registered service companies can click "Become a Pro" to complete onboarding and start receiving job requests.',
      aur: 'ہنرمند ٹیکنیشنز اور رجسٹرڈ سروس کمپنیاں "پرو بنیں" پر کلک کر کے آن بورڈنگ مکمل کر سکتی ہیں اور جاب درخواستیں وصول کرنا شروع کر سکتی ہیں۔',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-section-glow">
      <Container size="narrow">
        <div className="text-center space-y-2 mb-12">
          <span className="eyebrow">{t('FAQ', 'سوالات')}</span>
          <h2 className="section-title text-ink-900">
            {t('Frequently Asked Questions', 'اکثر پوچھے گئے سوالات')}
          </h2>
          <p className="text-sm text-ink-600">
            {t('Quick answers to common questions about PakFix AI, bookings and professionals.', 'پاک فکس اے آئی، بکنگ اور پروفیشنلز کے بارے میں عام سوالات کے فوری جوابات۔')}
          </p>
        </div>

        {/* Accordion Items */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="bg-surface rounded-2xl border border-line overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-start flex items-center justify-between gap-4 font-bold text-sm text-ink-900 hover:bg-surface-muted transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{t(faq.q, faq.qur)}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 text-brand-600 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen ? (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-ink-600 leading-relaxed border-t border-line pt-3">
                    {t(faq.a, faq.aur)}
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
