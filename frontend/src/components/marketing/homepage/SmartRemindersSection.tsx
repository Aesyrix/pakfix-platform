'use client';

import Link from 'next/link';
import { Bell, CalendarCheck, Wind, Droplets, Sun, Bug, Zap, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function SmartRemindersSection() {
  const t = useT();
  const reminders = [
    { en: 'AC Service', ur: 'اے سی سروس', cen: 'Every 6 Months', cur: 'ہر 6 ماہ', icon: Wind, den: 'Prevents compressor failure & saves electricity', dur: 'کمپریسر کی خرابی روکتا ہے اور بجلی بچاتا ہے' },
    { en: 'Water Tank Cleaning', ur: 'پانی کی ٹنکی کی صفائی', cen: 'Every 6 Months', cur: 'ہر 6 ماہ', icon: Droplets, den: 'Ensures hygienic water supply for family', dur: 'خاندان کے لیے صاف پانی کی فراہمی یقینی بناتا ہے' },
    { en: 'Solar Panel Cleaning', ur: 'سولر پینل کی صفائی', cen: 'Monthly', cur: 'ماہانہ', icon: Sun, den: 'Restores up to 25% lost energy efficiency', dur: '25% تک ضائع توانائی کی کارکردگی بحال کرتا ہے' },
    { en: 'Pest Control', ur: 'کیڑوں پر قابو', cen: 'Every 3 Months', cur: 'ہر 3 ماہ', icon: Bug, den: 'Protects furniture and wood from termites', dur: 'فرنیچر اور لکڑی کو دیمک سے بچاتا ہے' },
    { en: 'Generator Inspection', ur: 'جنریٹر معائنہ', cen: 'Every 3 Months', cur: 'ہر 3 ماہ', icon: Zap, den: 'Oil & filter change for backup power', dur: 'بیک اپ بجلی کے لیے تیل اور فلٹر تبدیلی' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold mb-2">
              <Bell className="h-3.5 w-3.5 text-[#00824A]" />
              {t('Automated Reminders', 'خودکار یاد دہانیاں')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616]">
              {t('PakFix remembers maintenance for you.', 'پاک فکس آپ کے لیے دیکھ بھال یاد رکھتا ہے۔')}
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              {t('Never miss important seasonal home care schedules.', 'گھریلو دیکھ بھال کے اہم موسمی شیڈول کبھی نہ چھوڑیں۔')}
            </p>
          </div>

          <Link
            href="/home-maintenance"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>{t('Create Maintenance Plan', 'دیکھ بھال کا منصوبہ بنائیں')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {reminders.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.en}
                className="bg-[#F8FAF9] rounded-2xl p-4 border border-[#E5E7EB] hover:border-[#00824A] transition-all space-y-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#00824A]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#161616]">{t(r.en, r.ur)}</h3>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF7F0] text-[#006838]">
                  {t(r.cen, r.cur)}
                </span>
                <p className="text-[11px] text-[#667085] leading-snug pt-1">{t(r.den, r.dur)}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
