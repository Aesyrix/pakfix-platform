'use client';

import Link from 'next/link';
import { Home, Calendar, History, Bell, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function HomeMaintenanceContent() {
  const t = useT();
  const features = [
    {
      icon: Home,
      title: { en: 'Digital Home Asset Vault', ur: 'ڈیجیٹل ہوم اثاثہ والٹ' },
      desc: {
        en: 'Log every AC unit, water motor, refrigerator, solar inverter and geyser in your house with serial numbers & warranty dates.',
        ur: 'اپنے گھر کے ہر اے سی یونٹ، واٹر موٹر، فریج، سولر انورٹر اور گیزر کو سیریل نمبرز اور وارنٹی تاریخوں کے ساتھ درج کریں۔',
      },
    },
    {
      icon: Calendar,
      title: { en: 'Preventive Service Schedules', ur: 'احتیاطی سروس شیڈول' },
      desc: {
        en: 'Avoid sudden mid-summer AC failures or water pump burnouts with automated 3-month and 6-month seasonal tune-up alerts.',
        ur: 'خودکار 3 ماہ اور 6 ماہ کے موسمی ٹیون اپ الرٹس کے ساتھ گرمیوں کے وسط میں اچانک اے سی فیل یا واٹر پمپ جلنے سے بچیں۔',
      },
    },
    {
      icon: History,
      title: { en: 'Complete Repair Logs', ur: 'مکمل مرمت کے ریکارڈ' },
      desc: {
        en: 'Keep every past job receipt, part replacement date, and technician report safely accessible online for your property.',
        ur: 'اپنی جائیداد کے لیے ہر ماضی کی رسید، پرزہ تبدیل کرنے کی تاریخ اور ٹیکنیشن رپورٹ آن لائن محفوظ رکھیں۔',
      },
    },
    {
      icon: Bell,
      title: { en: 'Smart Reminders', ur: 'سمارٹ یاد دہانیاں' },
      desc: {
        en: 'Receive SMS, WhatsApp, and push notifications when water tank cleaning, filter replacement, or solar washing is due.',
        ur: 'واٹر ٹینک صفائی، فلٹر تبدیلی یا سولر واشنگ کا وقت آنے پر ایس ایم ایس، واٹس ایپ اور پش اطلاعات موصول کریں۔',
      },
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Home Maintenance', 'ہوم مینٹیننس') }]}
        eyebrow={
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold">
            <Home className="h-3.5 w-3.5 text-[#00824A]" />
            {t('Property Care System', 'جائیداد کی دیکھ بھال کا نظام')}
          </div>
        }
        title={t('Keep Your Home Maintained, Not Just Repaired', 'اپنے گھر کی دیکھ بھال کریں، صرف مرمت نہیں')}
        subtitle={t('Prevent expensive home emergency breakdowns with PakFix structured maintenance tracking, asset history, and seasonal reminders.', 'پاک فکس کی منظم مینٹیننس ٹریکنگ، اثاثہ تاریخ اور موسمی یاد دہانیوں کے ساتھ مہنگی ہنگامی خرابیوں سے بچیں۔')}
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title.en} className="bg-[#F8FAF9] rounded-2xl p-6 border border-[#E5E7EB] space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#00824A]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#161616]">{t(f.title.en, f.title.ur)}</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">{t(f.desc.en, f.desc.ur)}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-[#161616] text-white rounded-3xl p-8 sm:p-12 border border-gray-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {t('Ready to organize your home care?', 'اپنے گھر کی دیکھ بھال منظم کرنے کے لیے تیار ہیں؟')}
            </h2>
            <p className="text-sm text-gray-300 max-w-xl mx-auto">
              {t('Add your property in seconds to begin logging appliances, viewing repair receipts, and scheduling tune-ups.', 'آلات درج کرنے، مرمت کی رسیدیں دیکھنے اور ٹیون اپ شیڈول کرنے کے لیے سیکنڈوں میں اپنی جائیداد شامل کریں۔')}
            </p>
            <div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all"
              >
                <span>{t('Open Customer Dashboard', 'کسٹمر ڈیش بورڈ کھولیں')}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
