'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Sparkles,
  Home,
  Calendar,
  FileText,
  MessageSquare,
  Wrench,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function CustomerDashboardPreviewSection() {
  const t = useT();
  const sidebarItems = [
    { en: 'Overview', ur: 'جائزہ', icon: LayoutDashboard, active: true },
    { en: 'PakFix AI', ur: 'پاک فکس اے آئی', icon: Sparkles },
    { en: 'Properties', ur: 'پراپرٹیز', icon: Home },
    { en: 'Bookings', ur: 'بکنگ', icon: Calendar, ben: '2 Active', bur: '2 فعال' },
    { en: 'Quotes', ur: 'تخمینے', icon: FileText, ben: '1 Open', bur: '1 کھلا' },
    { en: 'Messages', ur: 'پیغامات', icon: MessageSquare },
    { en: 'Maintenance', ur: 'دیکھ بھال', icon: Wrench, ben: 'Due', bur: 'واجب' },
    { en: 'Payments', ur: 'ادائیگیاں', icon: CreditCard },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Customer Portal', 'کسٹمر پورٹل')}</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            {t('Everything about your home in one place.', 'آپ کے گھر کی ہر چیز ایک جگہ۔')}
          </h2>
          <p className="text-sm text-[#475467]">
            {t('Track active repair jobs, inspect itemized quotes, check AI diagnosis history, and manage recurring maintenance.', 'فعال مرمت کے کام ٹریک کریں، تفصیلی تخمینے دیکھیں، اے آئی تشخیص کی تاریخ چیک کریں، اور بار بار دیکھ بھال سنبھالیں۔')}
          </p>
        </div>

        {/* Screenshot-Style Web App UI Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-floating overflow-hidden">
          {/* Top Window Control Bar */}
          <div className="bg-[#161616] px-4 py-3 flex items-center justify-between text-xs text-gray-400 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 font-mono text-[11px] text-gray-400">app.pakfix.pk/dashboard</span>
            </div>
            <span className="text-[#00A85B] font-bold">{t('Customer Portal', 'کسٹمر پورٹل')}</span>
          </div>

          {/* Web App Body Layout */}
          <div className="grid lg:grid-cols-12 min-h-[480px]">
            {/* App Sidebar */}
            <div className="lg:col-span-3 bg-[#161616] text-white p-4 border-r border-gray-800 space-y-1 hidden lg:block">
              <div className="px-3 py-2 text-xs font-extrabold text-[#00A85B] tracking-wider uppercase mb-2">
                {t('PAKFIX APP', 'پاک فکس ایپ')}
              </div>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.en}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      item.active ? 'bg-[#00824A] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{t(item.en, item.ur)}</span>
                    </div>
                    {item.ben ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-700 text-white">
                        {t(item.ben, item.bur)}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* App Main Content Area */}
            <div className="lg:col-span-9 p-6 sm:p-8 bg-[#F8FAF9] space-y-6">
              {/* Header banner inside app */}
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E7EB]">
                <div>
                  <h3 className="text-base font-extrabold text-[#161616]">{t('Welcome back, Ahmed!', 'خوش آمدید، احمد!')}</h3>
                  <p className="text-xs text-[#667085]">{t('Here is the live status for your property in Islamabad.', 'یہ اسلام آباد میں آپ کی پراپرٹی کی لائیو صورتحال ہے۔')}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838]">
                  {t('Verified Account', 'تصدیق شدہ اکاؤنٹ')}
                </span>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Card 1: Upcoming Booking */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161616]">
                    <span>{t('Upcoming Booking', 'آنے والی بکنگ')}</span>
                    <span className="text-[#00824A]">{t('Active', 'فعال')}</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#161616]">{t('AC Master Service & Gas Refill', 'اے سی ماسٹر سروس اور گیس ری فل')}</p>
                    <p className="text-[#667085]">{t('Technician:', 'ٹیکنیشن:')} {t('Ali Raza', 'علی رضا')} &bull; {t('Arriving Today 3 PM', 'آج 3 بجے دن پہنچیں گے')}</p>
                  </div>
                </div>

                {/* Card 2: Open Quote */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161616]">
                    <span>{t('Open Quote', 'کھلا تخمینہ')}</span>
                    <span className="text-[#2563EB]">{t('1 Pending', '1 زیر التوا')}</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#161616]">{t('Plumbing Leak Repair', 'پلمبنگ رساؤ کی مرمت')}</p>
                    <p className="text-[#667085]">{t('TechFix Quote: PKR 3,500 (Labour + Pipe)', 'ٹیک فکس تخمینہ: PKR 3,500 (مزدوری + پائپ)')}</p>
                  </div>
                </div>

                {/* Card 3: Recent Diagnosis */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161616]">
                    <span>{t('Recent AI Diagnosis', 'حالیہ اے آئی تشخیص')}</span>
                    <span className="text-xs text-[#667085]">{t('Yesterday', 'کل')}</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#161616]">{t('Circuit Overload Alert', 'سرکٹ اوورلوڈ انتباہ')}</p>
                    <p className="text-[#667085]">{t('Safety: Medium Risk • Electrician Recommended', 'حفاظت: درمیانہ خطرہ • الیکٹریشن تجویز کردہ')}</p>
                  </div>
                </div>

                {/* Card 4: Maintenance Due */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161616]">
                    <span>{t('Maintenance Schedule', 'دیکھ بھال کا شیڈول')}</span>
                    <span className="text-amber-700 font-bold">{t('Due', 'واجب')}</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#161616]">{t('Water Tank Deep Cleaning', 'پانی کی ٹنکی کی گہری صفائی')}</p>
                    <p className="text-[#667085]">{t('Scheduled for Next Week • 6 Mo Cycle', 'اگلے ہفتے شیڈول • 6 ماہ سائیکل')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
