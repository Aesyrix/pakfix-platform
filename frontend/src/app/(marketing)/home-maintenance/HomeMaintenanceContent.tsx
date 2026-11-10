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
      title: { en: 'Digital Asset Vault', ur: 'ڈیجیٹل اثاثہ والٹ' },
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
          <span className="eyebrow">{t('Property Care System', 'جائیداد کی دیکھ بھال کا نظام')}</span>
        }
        title={t('Keep Your Property Maintained, Not Just Repaired', 'اپنی پراپرٹی کی دیکھ بھال کریں، صرف مرمت نہیں')}
        subtitle={t('Prevent expensive home emergency breakdowns with PakFix structured maintenance tracking, asset history, and seasonal reminders.', 'پاک فکس کی منظم مینٹیننس ٹریکنگ، اثاثہ تاریخ اور موسمی یاد دہانیوں کے ساتھ مہنگی ہنگامی خرابیوں سے بچیں۔')}
      />

      <section className="py-16 sm:py-24 bg-surface">
        <Container>
          <div className="mx-auto mb-16 grid max-w-5xl gap-5 md:grid-cols-2">
            {features.map((f, index) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title.en}
                  className="group flex items-center gap-5 rounded-2xl border border-line/60 bg-surface-muted p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lifted sm:p-6 motion-reduce:hover:translate-y-0"
                >
                  <div className="min-w-0 flex-1 space-y-3">
                    {/* Title as a dark tag with an emerald square */}
                    <h3 className="inline-flex items-center gap-2 rounded-md bg-ink-950 px-2.5 py-1.5 [[data-mode=dark]_&]:bg-white/10 [[data-mode=dark]_&]:ring-1 [[data-mode=dark]_&]:ring-white/15 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-white">
                      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-[2px] bg-brand-on-dark" />
                      {t(f.title.en, f.title.ur)}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-500">{t(f.desc.en, f.desc.ur)}</p>
                  </div>

                  {/* Step number in a white tile; the icon sits in its corner */}
                  <div aria-hidden="true" className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-surface shadow-xs ring-1 ring-line/60 sm:h-28 sm:w-28">
                    <Icon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-brand-500 opacity-70" />
                    <span className="font-display text-5xl font-bold tracking-[-0.04em] text-ink-300 transition-colors duration-300 group-hover:text-brand-500 sm:text-6xl">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative isolate overflow-hidden bg-premium-dark text-white rounded-3xl p-8 sm:p-14 border border-white/10 shadow-floating text-center space-y-6">
            <h2 className="section-title text-white">
              {t('Ready to organize your property care?', 'اپنی پراپرٹی کی دیکھ بھال منظم کرنے کے لیے تیار ہیں؟')}
            </h2>
            <p className="text-sm text-ink-300 max-w-xl mx-auto">
              {t('Add your property in seconds to begin logging appliances, viewing repair receipts, and scheduling tune-ups.', 'آلات درج کرنے، مرمت کی رسیدیں دیکھنے اور ٹیون اپ شیڈول کرنے کے لیے سیکنڈوں میں اپنی جائیداد شامل کریں۔')}
            </p>
            <div>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center gap-2 px-8 rounded-[var(--radius-button)] bg-brand-solid hover:bg-brand-solid-hover text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5"
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
