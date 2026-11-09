'use client';

import Link from 'next/link';
import { ShieldAlert, Phone, AlertCircle, Zap, Droplets, Lock, Wind } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function EmergencyRepairSection() {
  const t = useT();
  const emergencies = [
    { en: 'Major Plumbing Leak', ur: 'شدید پلمبنگ رساؤ', icon: Droplets, den: 'Uncontrolled pipe burst or water tank overflow', dur: 'بے قابو پائپ پھٹنا یا پانی کی ٹنکی کا بہاؤ' },
    { en: 'Electrical Short Fault', ur: 'الیکٹریکل شارٹ فالٹ', icon: Zap, den: 'Power tripping or burning smell near DB panel', dur: 'بجلی ٹرپ ہونا یا ڈی بی پینل کے قریب جلن کی بو' },
    { en: 'Water Pump Failure', ur: 'واٹر پمپ کی خرابی', icon: Droplets, den: 'Zero water supply to overhead tanks', dur: 'اوپر والی ٹنکیوں میں پانی کی فراہمی بند' },
    { en: 'Door Lock Outage', ur: 'دروازے کے تالے کی خرابی', icon: Lock, den: 'Main door jam or security lock breakdown', dur: 'مین دروازہ پھنسنا یا سیکیورٹی تالا خراب ہونا' },
    { en: 'AC Complete Breakdown', ur: 'اے سی مکمل خرابی', icon: Wind, den: 'Extreme summer heat emergency servicing', dur: 'شدید گرمی میں ہنگامی سروسنگ' },
  ];

  return (
    <section className="py-12 bg-white border-b border-line">
      <Container>
        <div className="bg-ink-900 text-white rounded-2xl p-6 sm:p-10 relative overflow-hidden border border-ink-800">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger-500/20 border border-danger-500/40 text-danger-200 text-xs font-bold">
                <AlertCircle className="h-4 w-4" />
                <span>{t('Urgent Emergency Service', 'ہنگامی فوری سروس')}</span>
              </div>

              <h2 className="section-title text-white">
                {t('Need urgent help?', 'فوری مدد کی ضرورت ہے؟')}
              </h2>

              <p className="text-xs sm:text-sm text-ink-400 leading-relaxed">
                {t('Create an urgent service request with photo, location and contact info to dispatch local emergency repair technicians.', 'تصویر، مقام اور رابطہ معلومات کے ساتھ ہنگامی درخواست بنائیں تاکہ مقامی ہنگامی مرمت ٹیکنیشنز بھیجے جا سکیں۔')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="#quick-booking"
                  className="px-5 py-2.5 rounded-xl bg-danger-500 hover:bg-danger-700 text-white text-xs font-bold transition-colors shadow-md"
                >
                  {t('Request Urgent Service', 'ہنگامی سروس کی درخواست کریں')}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-white text-xs font-bold transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-brand-600" />
                  <span>{t('Contact Support', 'سپورٹ سے رابطہ کریں')}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {emergencies.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.en}
                    className="bg-ink-900/90 rounded-xl p-3.5 border border-ink-800 hover:border-danger-500 transition-colors space-y-1.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-500/20 text-danger-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold text-white">{t(item.en, item.ur)}</h3>
                    <p className="text-[10px] text-ink-400 leading-snug">{t(item.den, item.dur)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
