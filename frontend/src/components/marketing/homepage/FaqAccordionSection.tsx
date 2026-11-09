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
      a: 'PakFix is Pakistan’s smart home repair and property maintenance platform. It combines AI problem diagnosis with identity-verified local technicians for plumbing, electrical, AC repair, appliance care, and home improvement.',
      aur: 'پاک فکس پاکستان کا سمارٹ ہوم ریپیئر اور پراپرٹی مینٹیننس پلیٹ فارم ہے۔ یہ اے آئی مسئلہ تشخیص کو شناخت سے تصدیق شدہ مقامی ٹیکنیشنز کے ساتھ جوڑتا ہے — پلمبنگ، الیکٹریکل، اے سی مرمت، آلات کی دیکھ بھال اور گھریلو بہتری کے لیے۔',
    },
    {
      q: 'How does PakFix AI work?',
      qur: 'پاک فکس اے آئی کیسے کام کرتا ہے؟',
      a: 'You describe the problem in simple words or upload photos/videos. PakFix AI analyzes symptoms to identify potential causes, check safety risks, estimate repair costs in PKR, and recommend the right service specialist.',
      aur: 'آپ سادہ الفاظ میں مسئلہ بیان کرتے ہیں یا تصاویر/ویڈیوز اپلوڈ کرتے ہیں۔ پاک فکس اے آئی علامات کا تجزیہ کر کے ممکنہ وجوہات بتاتا ہے، حفاظتی خطرات جانچتا ہے، روپے میں مرمت کی لاگت کا تخمینہ لگاتا ہے، اور صحیح سروس اسپیشلسٹ تجویز کرتا ہے۔',
    },
    {
      q: 'Is AI diagnosis a replacement for a technician?',
      qur: 'کیا اے آئی تشخیص ٹیکنیشن کا متبادل ہے؟',
      a: 'No. PakFix AI provides immediate guidance and cost estimation, but physical repairs—especially electrical, gas or structural work—should always be inspected and completed by a verified human professional.',
      aur: 'نہیں۔ پاک فکس اے آئی فوری رہنمائی اور لاگت کا تخمینہ دیتا ہے، لیکن حقیقی مرمت — خاص طور پر الیکٹریکل، گیس یا ڈھانچے کا کام — ہمیشہ تصدیق شدہ انسانی پروفیشنل سے کروانی اور جانچنی چاہیے۔',
    },
    {
      q: 'Can I upload photos or videos?',
      qur: 'کیا میں تصاویر یا ویڈیوز اپلوڈ کر سکتا ہوں؟',
      a: 'Yes. You can add photos in the AI assistant and when you post a request in the app.',
      aur: 'جی ہاں۔ آپ اے آئی اسسٹنٹ میں اور ایپ میں درخواست بھیجتے وقت تصاویر شامل کر سکتے ہیں۔',
    },
    {
      q: 'Can I request multiple quotes?',
      qur: 'کیا میں متعدد تخمینے طلب کر سکتا ہوں؟',
      a: 'Yes! You can request itemized quotes from multiple local professionals, compare labor and material charges side by side, and accept the offer that fits your budget.',
      aur: 'جی ہاں! آپ متعدد مقامی پروفیشنلز سے تفصیلی تخمینے طلب کر سکتے ہیں، مزدوری اور مواد کے چارجز کا ساتھ ساتھ موازنہ کر سکتے ہیں، اور اپنے بجٹ کے مطابق آفر قبول کر سکتے ہیں۔',
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
    <section className="py-16 sm:py-24 bg-surface-muted border-b border-line">
      <Container size="narrow">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{t('FAQ', 'سوالات')}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900">
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
                className="bg-white rounded-2xl border border-line overflow-hidden transition-all"
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
