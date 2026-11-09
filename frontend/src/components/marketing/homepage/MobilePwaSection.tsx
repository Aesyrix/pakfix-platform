'use client';

import Link from 'next/link';
import { Smartphone, Download, Sparkles, Bell, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function MobilePwaSection() {
  const t = useT();
  return (
    <section className="py-16 sm:py-24 bg-brand-100 border-b border-line">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-brand-700 text-xs font-bold">
              <Smartphone className="h-3.5 w-3.5 text-brand-600" />
              {t('PWA & Mobile Ready', 'پی ڈبلیو اے اور موبائل کے لیے تیار')}
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-ink-900">
              {t('PakFix goes wherever your home needs help.', 'پاک فکس وہاں جاتا ہے جہاں آپ کے گھر کو مدد کی ضرورت ہو۔')}
            </h2>

            <p className="text-sm text-ink-600 leading-relaxed">
              {t('Install the PakFix Web App on your phone in seconds. Access AI diagnosis, live job tracking, technician messaging and maintenance alerts anywhere.', 'پاک فکس ویب ایپ سیکنڈوں میں اپنے فون پر انسٹال کریں۔ اے آئی تشخیص، لائیو جاب ٹریکنگ، ٹیکنیشن پیغام رسانی اور دیکھ بھال کے الرٹس کہیں بھی حاصل کریں۔')}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-900">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                <span>{t('Instant AI Assistant', 'فوری اے آئی اسسٹنٹ')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-900">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                <span>{t('Live Technician Tracking', 'لائیو ٹیکنیشن ٹریکنگ')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-900">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                <span>{t('Smart Maintenance Reminders', 'سمارٹ دیکھ بھال یاد دہانیاں')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-900">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                <span>{t('Zero App Store Download Needed', 'ایپ اسٹور ڈاؤن لوڈ کی ضرورت نہیں')}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{t('Install PakFix Web App', 'پاک فکس ویب ایپ انسٹال کریں')}</span>
              </button>

              <span className="text-xs font-semibold text-ink-500 px-3 py-2 rounded-xl bg-white border border-line">
                {t('Android & iOS Apps — Coming Soon', 'اینڈرائیڈ اور آئی او ایس ایپس — جلد آ رہی ہیں')}
              </span>
            </div>
          </div>

          {/* Right Phone Mockup graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-64 bg-ink-900 p-3 rounded-[40px] border-4 border-ink-800 shadow-2xl relative">
              <div className="h-5 w-24 bg-ink-900 rounded-full mx-auto mb-3" />
              <div className="bg-white rounded-[28px] p-4 text-xs space-y-3 min-h-[380px]">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-extrabold text-ink-900">{t('PakFix App', 'پاک فکس ایپ')}</span>
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                </div>
                <div className="bg-brand-100 p-3 rounded-xl text-[11px] text-brand-700 font-semibold">
                  {t('AI Diagnosis: AC Filter & Gas Issue', 'اے آئی تشخیص: اے سی فلٹر اور گیس کا مسئلہ')}
                </div>
                <div className="bg-surface-muted p-3 rounded-xl border space-y-1">
                  <span className="text-[10px] text-ink-500">{t('Technician Assigned', 'ٹیکنیشن تفویض ہو گیا')}</span>
                  <p className="font-bold text-ink-900">{t('Your professional', 'آپ کا پروفیشنل')} &bull; {t('On the way', 'راستے میں')}</p>
                </div>
                <div className="bg-brand-600 text-white p-3 rounded-xl font-bold text-center">
                  {t('Book Professional', 'پروفیشنل بک کریں')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
