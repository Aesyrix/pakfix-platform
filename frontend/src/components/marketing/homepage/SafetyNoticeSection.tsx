'use client';

import Link from 'next/link';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function SafetyNoticeSection() {
  const t = useT();
  const hazards = [
    { en: 'Gas Leaks & Smell', ur: 'گیس کا اخراج اور بو', den: 'Sui gas or LPG cylinder leaks require immediate professional shutoff.', dur: 'سوئی گیس یا ایل پی جی سلنڈر کے اخراج پر فوری پروفیشنل بندش ضروری ہے۔' },
    { en: 'High-Voltage Faults', ur: 'ہائی وولٹیج خرابیاں', den: 'Main distribution box shorts or exposed 220V/440V wiring.', dur: 'مین ڈسٹری بیوشن باکس شارٹ یا کھلی 220V/440V وائرنگ۔' },
    { en: 'Structural Damage', ur: 'ڈھانچے کو نقصان', den: 'Load-bearing wall cracks, roof sagging, or ceiling collapse risk.', dur: 'لوڈ بیئرنگ دیوار کی دراڑیں، چھت کا جھکاؤ یا گرنے کا خطرہ۔' },
    { en: 'Major Water Flooding', ur: 'شدید پانی کا بہاؤ', den: 'Burst main water supply lines or sewer backup emergencies.', dur: 'مین واٹر سپلائی لائن پھٹنا یا گٹر بیک اپ کی ایمرجنسی۔' },
  ];

  return (
    <section className="py-12 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="bg-[#FFF5F5] rounded-2xl border-2 border-[#DC2626]/20 p-6 sm:p-8 relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Header */}
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 text-[#B91C1C] text-xs font-bold">
                <ShieldAlert className="h-4 w-4" />
                <span>{t('Safety Protocol', 'حفاظتی پروٹوکول')}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#161616]">
                {t('Some repairs should', 'کچھ مرمتیں')} <span className="text-[#B91C1C]">{t('never be DIY.', 'ہرگز خود نہ کریں۔')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
                {t('PakFix AI strictly classifies high-hazard situations as High Risk and instantly connects you with licensed professionals to protect your home and family.', 'پاک فکس اے آئی شدید خطرے والے حالات کو ہائی رسک قرار دیتا ہے اور آپ کے گھر اور خاندان کی حفاظت کے لیے فوراً لائسنس یافتہ پروفیشنلز سے جوڑ دیتا ہے۔')}
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B91C1C] hover:underline"
                >
                  <span>{t('Read Emergency Safety Rules', 'ہنگامی حفاظتی اصول پڑھیں')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Hazards Grid */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
              {hazards.map((h) => (
                <div key={h.en} className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#161616]">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#B91C1C]" />
                    <span>{t(h.en, h.ur)}</span>
                  </div>
                  <p className="text-[11px] text-[#667085] leading-snug">{t(h.den, h.dur)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
