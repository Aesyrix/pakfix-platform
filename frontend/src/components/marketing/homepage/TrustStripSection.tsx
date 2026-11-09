'use client';

import { Sparkles, ShieldCheck, DollarSign, Lock } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function TrustStripSection() {
  const t = useT();
  const items = [
    {
      icon: Sparkles,
      en: 'AI-Powered Diagnosis',
      ur: 'اے آئی سے تشخیص',
      den: 'Instant guidance in plain language',
      dur: 'آسان زبان میں فوری رہنمائی',
    },
    {
      icon: ShieldCheck,
      en: 'Verified Professionals',
      ur: 'تصدیق شدہ پروفیشنلز',
      den: 'Identity checked by our team',
      dur: 'شناخت کی جانچ ہماری ٹیم کرتی ہے',
    },
    {
      icon: DollarSign,
      en: 'Transparent Quotes',
      ur: 'شفاف تخمینے',
      den: 'See the full price before you accept',
      dur: 'قبول کرنے سے پہلے پوری قیمت دیکھیں',
    },
    {
      icon: Lock,
      en: 'Simple Payment',
      ur: 'آسان ادائیگی',
      den: 'Pay cash once you confirm the job is done',
      dur: 'کام کی تصدیق کے بعد نقد ادائیگی کریں',
    },
  ];

  return (
    <section className="py-6 border-b border-line bg-surface-muted">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.en}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-line shadow-2xs"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink-900">{t(item.en, item.ur)}</h3>
                  <p className="text-[11px] text-ink-500 leading-snug mt-0.5">{t(item.den, item.dur)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
