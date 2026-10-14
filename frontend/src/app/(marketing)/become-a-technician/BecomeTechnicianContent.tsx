'use client';

import {
  Wrench,
  ShieldCheck,
  DollarSign,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function BecomeTechnicianContent() {
  const t = useT();
  const benefits = [
    {
      icon: Briefcase,
      title: { en: 'More Nearby Jobs', ur: 'آس پاس مزید کام' },
      desc: {
        en: 'Receive job leads from homeowners in your area directly on your phone.',
        ur: 'اپنے علاقے کے گھر مالکان سے جاب لیڈز براہِ راست اپنے فون پر حاصل کریں۔',
      },
    },
    {
      icon: DollarSign,
      title: { en: 'Transparent Earnings', ur: 'شفاف آمدنی' },
      desc: {
        en: 'Set your rates, quote labor & materials, and get paid promptly with zero hidden commission.',
        ur: 'اپنے ریٹ مقرر کریں، مزدوری اور سامان کا کوٹ دیں، اور بغیر کسی چھپی کمیشن کے فوری ادائیگی پائیں۔',
      },
    },
    {
      icon: ShieldCheck,
      title: { en: 'Verified Pro Badge', ur: 'تصدیق شدہ پروفیشنل بیج' },
      desc: {
        en: 'Build trust with verified CNIC verification and accumulate 5-star customer reviews.',
        ur: 'تصدیق شدہ شناختی کارڈ سے اعتماد بنائیں اور 5 ستارہ گاہک ریویوز جمع کریں۔',
      },
    },
    {
      icon: Wrench,
      title: { en: 'Full Scheduling Control', ur: 'مکمل شیڈولنگ کنٹرول' },
      desc: {
        en: 'Work on your own terms. Accept jobs that match your expertise and availability.',
        ur: 'اپنی شرائط پر کام کریں۔ وہ کام قبول کریں جو آپ کی مہارت اور دستیابی سے مطابقت رکھتے ہوں۔',
      },
    },
  ];

  const cities = [
    { en: 'Islamabad', ur: 'اسلام آباد' },
    { en: 'Rawalpindi', ur: 'راولپنڈی' },
    { en: 'Lahore', ur: 'لاہور' },
    { en: 'Karachi', ur: 'کراچی' },
    { en: 'Peshawar', ur: 'پشاور' },
    { en: 'Faisalabad', ur: 'فیصل آباد' },
  ];

  const trades = [
    { value: 'Plumber', en: 'Plumber & Drainage', ur: 'پلمبر اور نکاسی آب' },
    { value: 'Electrician', en: 'Electrician & UPS Specialist', ur: 'الیکٹریشن اور یو پی ایس ماہر' },
    { value: 'AC Mechanic', en: 'AC Technician & Service', ur: 'اے سی ٹیکنیشن اور سروس' },
    { value: 'Appliance Tech', en: 'Appliance Care', ur: 'آلات کی دیکھ بھال' },
    { value: 'Solar Installer', en: 'Solar Panel Setup', ur: 'سولر پینل سیٹ اپ' },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Become a Pro', 'پروفیشنل بنیں') }]}
        eyebrow={
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold">
            <UserCheck className="h-3.5 w-3.5 text-[#00824A]" />
            {t("Join Pakistan's Pro Network", 'پاکستان کے پروفیشنل نیٹ ورک میں شامل ہوں')}
          </div>
        }
        title={t('Grow Your Home Service Business', 'اپنا گھریلو سروس کاروبار بڑھائیں')}
        subtitle={t('Are you a skilled plumber, electrician, AC mechanic or appliance technician? Register with PakFix to connect directly with paying customers across Pakistan.', 'کیا آپ ہنرمند پلمبر، الیکٹریشن، اے سی مکینک یا آلات کے ٹیکنیشن ہیں؟ پاک فکس کے ساتھ رجسٹر ہوں اور پورے پاکستان میں ادائیگی کرنے والے گاہکوں سے براہِ راست جڑیں۔')}
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Why Join PakFix?', 'پاک فکس کیوں جوائن کریں؟')}</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
                {t('Everything you need to succeed as a professional.', 'ایک پروفیشنل کے طور پر کامیابی کے لیے ہر ضروری چیز۔')}
              </h2>
              <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
                {t('PakFix handles marketing, customer inquiry management, and diagnostic verification so you can focus on delivering high-quality work.', 'پاک فکس مارکیٹنگ، گاہک استفسار کے انتظام اور تشخیصی تصدیق سنبھالتا ہے تاکہ آپ اعلیٰ معیار کا کام دینے پر توجہ دے سکیں۔')}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title.en} className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-1.5">
                      <Icon className="h-5 w-5 text-[#00824A]" />
                      <h3 className="text-sm font-bold text-[#161616]">{t(b.title.en, b.title.ur)}</h3>
                      <p className="text-xs text-[#667085] leading-snug">{t(b.desc.en, b.desc.ur)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Registration Card */}
            <div className="lg:col-span-6">
              <div className="bg-[#161616] text-white rounded-3xl p-8 border border-gray-800 shadow-card space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#00A85B] uppercase tracking-wider">{t('Fast Onboarding', 'تیز آن بورڈنگ')}</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{t('Register in 3 Minutes', '3 منٹ میں رجسٹر کریں')}</h3>
                  <p className="text-xs text-gray-400 mt-1">{t('Submit your details to start receiving job leads.', 'جاب لیڈز وصول کرنا شروع کرنے کے لیے اپنی تفصیلات جمع کروائیں۔')}</p>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">{t('Full Name', 'پورا نام')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('e.g. Muhammad Ali', 'مثلاً محمد علی')}
                      className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00824A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">{t('Phone / WhatsApp', 'فون / واٹس ایپ')}</label>
                      <input
                        type="tel"
                        required
                        placeholder="0300 1234567"
                        className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00824A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">{t('City', 'شہر')}</label>
                      <select className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white outline-none focus:border-[#00824A]">
                        {cities.map((c) => (
                          <option key={c.en} value={c.en}>{t(c.en, c.ur)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">{t('Primary Skill Trade', 'بنیادی ہنر')}</label>
                    <select className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white outline-none focus:border-[#00824A]">
                      {trades.map((tr) => (
                        <option key={tr.value} value={tr.value}>{t(tr.en, tr.ur)}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    {t('Submit Registration', 'رجسٹریشن جمع کروائیں')} &rarr;
                  </button>
                </form>

                <div className="pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
                  <span>{t('Questions? Call Pro Onboarding Helpline:', 'سوالات؟ پروفیشنل آن بورڈنگ ہیلپ لائن پر کال کریں:')} </span>
                  <a href="tel:+923001234567" dir="ltr" className="text-[#00A85B] font-bold hover:underline">
                    +92 300 123 4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
