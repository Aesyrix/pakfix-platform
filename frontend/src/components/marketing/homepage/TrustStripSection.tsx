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
      den: 'Instant, accurate problem identification',
      dur: 'فوری اور درست مسئلے کی نشاندہی',
    },
    {
      icon: ShieldCheck,
      en: 'Verified Professionals',
      ur: 'تصدیق شدہ پروفیشنلز',
      den: 'Identity and skill checked technicians',
      dur: 'شناخت اور مہارت کی جانچ والے ٹیکنیشن',
    },
    {
      icon: DollarSign,
      en: 'Transparent Quotes',
      ur: 'شفاف تخمینے',
      den: 'No hidden charges or unexpected fees',
      dur: 'کوئی چھپا چارج یا غیر متوقع فیس نہیں',
    },
    {
      icon: Lock,
      en: 'Secure Booking',
      ur: 'محفوظ بکنگ',
      den: 'Safe & hassle-free payment handling',
      dur: 'محفوظ اور بغیر جھنجھٹ ادائیگی',
    },
  ];

  return (
    <section className="py-6 border-b border-[#E5E7EB] bg-[#F8FAF9]">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.en}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF7F0] text-[#00532C]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#161616]">{t(item.en, item.ur)}</h3>
                  <p className="text-[11px] text-[#667085] leading-snug mt-0.5">{t(item.den, item.dur)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
