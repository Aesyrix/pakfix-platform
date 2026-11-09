'use client';

import Link from 'next/link';
import { Home, ShieldCheck, History, Calendar, Bell, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function HomeMaintenanceSection() {
  const t = useT();
  const assets = [
    { en: 'Living Room Inverter AC', ur: 'لونگ روم انورٹر اے سی', lsen: '3 Months Ago', lsur: '3 ماہ پہلے', nsen: 'Due in 15 Days', nsur: '15 دن میں واجب', sen: 'Maintenance Due', sur: 'دیکھ بھال واجب', due: true },
    { en: 'Dawlance Refrigerator', ur: 'ڈاؤلنس ریفریجریٹر', lsen: '6 Months Ago', lsur: '6 ماہ پہلے', nsen: 'Healthy', nsur: 'صحتمند', sen: 'Good Condition', sur: 'اچھی حالت', due: false },
    { en: 'Solar Inverter 10kW', ur: 'سولر انورٹر 10kW', lsen: '1 Month Ago', lsur: '1 ماہ پہلے', nsen: 'Cleaned', nsur: 'صاف شدہ', sen: 'Optimal Output', sur: 'بہترین پیداوار', due: false },
    { en: 'Water Pump Motor', ur: 'واٹر پمپ موٹر', lsen: '4 Months Ago', lsur: '4 ماہ پہلے', nsen: 'Due Next Month', nsur: 'اگلے ماہ واجب', sen: 'Inspection Due', sur: 'معائنہ واجب', due: true },
  ];

  return (
    <section className="py-16 sm:py-24 bg-surface-muted border-b border-line">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{t('Property Care', 'پراپرٹی کی دیکھ بھال')}</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-ink-900">
              {t('Keep your home maintained,', 'اپنے گھر کو برقرار رکھیں،')}<br />
              <span className="text-brand-600">{t('not just repaired.', 'صرف مرمت نہیں۔')}</span>
            </h2>
            <p className="text-sm text-ink-600 leading-relaxed">
              {t('Track appliances, save full repair history, schedule recurring preventive maintenance, and receive smart reminders.', 'آلات ٹریک کریں، مکمل مرمت کی تاریخ محفوظ کریں، بار بار حفاظتی دیکھ بھال شیڈول کریں، اور سمارٹ یاد دہانیاں حاصل کریں۔')}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-xl border border-line flex items-center gap-2.5">
                <Home className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">{t('Add Your Property', 'اپنی پراپرٹی شامل کریں')}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-line flex items-center gap-2.5">
                <History className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">{t('Save Repair History', 'مرمت کی تاریخ محفوظ کریں')}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-line flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">{t('Schedule Maintenance', 'دیکھ بھال شیڈول کریں')}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-line flex items-center gap-2.5">
                <Bell className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">{t('Get Smart Reminders', 'سمارٹ یاد دہانیاں حاصل کریں')}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/home-maintenance"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>{t('Add Your Home Assets', 'اپنے گھریلو آلات شامل کریں')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Dashboard Assets Preview */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-line p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-extrabold text-ink-900">{t('MY HOME ASSETS & MAINTENANCE', 'میرے گھریلو آلات اور دیکھ بھال')}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700">
                {t('4 Assets Logged', '4 آلات درج')}
              </span>
            </div>

            <div className="space-y-3">
              {assets.map((a) => (
                <div key={a.en} className="p-3.5 rounded-xl bg-surface-muted border border-line flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-ink-900">{t(a.en, a.ur)}</h4>
                    <p className="text-[10px] text-ink-500">{t('Last Service:', 'آخری سروس:')} {t(a.lsen, a.lsur)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      a.due ? 'bg-warn-100 text-warn-800' : 'bg-brand-100 text-brand-700'
                    }`}>
                      {t(a.sen, a.sur)}
                    </span>
                    <p className="text-[10px] text-ink-500 mt-1">{t(a.nsen, a.nsur)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
