'use client';

import Link from 'next/link';
import { ShieldAlert, Phone, Zap, Droplets, Lock, Wind } from 'lucide-react';
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
    <section className="pb-16 sm:pb-24 bg-surface">
      <Container>
        <div className="keep-tone bg-premium-dark text-white rounded-3xl p-6 sm:p-10 relative isolate overflow-hidden border border-white/10 shadow-floating">
          <div aria-hidden="true" className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-danger-500/25 blur-[100px]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-60" />
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger-500/20 border border-danger-500/40 text-danger-200 text-xs font-bold">
                <span aria-hidden="true" className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-500 opacity-75 motion-reduce:hidden" /><span className="relative inline-flex h-2 w-2 rounded-full bg-danger-500" /></span>
                <span>{t('Urgent Emergency Service', 'ہنگامی فوری سروس')}</span>
              </div>

              <h2 className="section-title text-white">
                {t('Need urgent help?', 'فوری مدد کی ضرورت ہے؟')}
              </h2>

              <p className="text-sm text-ink-300 leading-relaxed">
                {t('Create an urgent service request with photo, location and contact info to dispatch local emergency repair technicians.', 'تصویر، مقام اور رابطہ معلومات کے ساتھ ہنگامی درخواست بنائیں تاکہ مقامی ہنگامی مرمت ٹیکنیشنز بھیجے جا سکیں۔')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="#quick-booking"
                  className="inline-flex min-h-11 items-center px-5 rounded-[var(--radius-button)] bg-danger-500 hover:bg-danger-solid-hover text-white text-sm font-semibold transition-colors shadow-lg shadow-danger-500/30"
                >
                  {t('Request Urgent Service', 'ہنگامی سروس کی درخواست کریں')}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center gap-1.5 px-4 rounded-[var(--radius-button)] border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-brand-on-dark" aria-hidden="true" />
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
                    className="rounded-2xl p-4 border border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-danger-500/60 hover:bg-white/[0.07] transition-colors space-y-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-500/20 text-danger-200">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{t(item.en, item.ur)}</h3>
                    <p className="text-xs text-ink-300 leading-snug">{t(item.den, item.dur)}</p>
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
