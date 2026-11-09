'use client';

import {
  Wrench,
  ShieldCheck,
  DollarSign,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { type FormEvent } from 'react';
import { Container } from '@/components/ui/Container';
import { useLeadForm } from '@/components/marketing/useLeadForm';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function BecomeTechnicianContent() {
  const t = useT();
  const lead = useLeadForm(t('Could not send your details. Please try again.', 'آپ کی تفصیلات نہیں بھیجی جا سکیں۔ دوبارہ کوشش کریں۔'));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? '').trim();
    const ok = await lead.send({
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      topic: 'professional',
      subject: `Professional registration: ${value('trade')}`,
      message: `Wants to join PakFix as a professional.\nTrade: ${value('trade')}\nCity: ${value('city')}\nPhone: ${value('phone')}`,
    });
    if (ok) form.reset();
  }

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
        en: 'Set your own prices, quote labour and materials, and keep your earnings. Free to join at launch.',
        ur: 'اپنی قیمت خود طے کریں، مزدوری اور سامان کا کوٹ دیں اور اپنی کمائی رکھیں۔ آغاز میں شمولیت مفت ہے۔',
      },
    },
    {
      icon: ShieldCheck,
      title: { en: 'Verified Pro Badge', ur: 'تصدیق شدہ پروفیشنل بیج' },
      desc: {
        en: 'Build trust with a verified badge and reviews from real customers.',
        ur: 'تصدیق شدہ بیج اور حقیقی گاہکوں کے ریویوز سے اعتماد بنائیں۔',
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
            <UserCheck className="h-3.5 w-3.5 text-brand-600" />
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
              <span className="eyebrow">{t('Why Join PakFix?', 'پاک فکس کیوں جوائن کریں؟')}</span>
              <h2 className="section-title text-ink-900">
                {t('Everything you need to succeed as a professional.', 'ایک پروفیشنل کے طور پر کامیابی کے لیے ہر ضروری چیز۔')}
              </h2>
              <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
                {t('PakFix handles marketing, customer inquiry management, and diagnostic verification so you can focus on delivering high-quality work.', 'پاک فکس مارکیٹنگ، گاہک استفسار کے انتظام اور تشخیصی تصدیق سنبھالتا ہے تاکہ آپ اعلیٰ معیار کا کام دینے پر توجہ دے سکیں۔')}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title.en} className="p-4 rounded-2xl bg-surface-muted border border-line space-y-1.5">
                      <Icon className="h-5 w-5 text-brand-600" />
                      <h3 className="text-sm font-bold text-ink-900">{t(b.title.en, b.title.ur)}</h3>
                      <p className="text-xs text-ink-500 leading-snug">{t(b.desc.en, b.desc.ur)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Registration Card */}
            <div className="lg:col-span-6">
              <div className="bg-ink-900 text-white rounded-3xl p-8 border border-ink-800 shadow-card space-y-6">
                <div>
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">{t('Fast Onboarding', 'تیز آن بورڈنگ')}</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{t('Register Your Interest', 'اپنی دلچسپی درج کریں')}</h3>
                  <p className="text-xs text-ink-400 mt-1">{t('Send your details and the PakFix team will contact you about getting verified.', 'اپنی تفصیلات بھیجیں، پاک فکس ٹیم تصدیق کے لیے آپ سے رابطہ کرے گی۔')}</p>
                </div>

                <form className="space-y-4" onSubmit={submit}>
                  {lead.sent ? (
                    <p role="status" className="rounded-xl bg-brand-100 p-3 text-xs font-semibold text-brand-700">
                      {t('Thank you! Your details have reached the PakFix team.', 'شکریہ! آپ کی تفصیلات پاک فکس ٹیم تک پہنچ گئی ہیں۔')}
                    </p>
                  ) : null}
                  {lead.error ? <p role="alert" className="rounded-xl bg-danger-50 p-3 text-xs font-medium text-danger-700">{lead.error}</p> : null}
                  <div>
                    <label className="block text-xs font-bold text-ink-300 mb-1">{t('Full Name', 'پورا نام')}</label>
                    <input
                      name="name"
                      type="text"
                      required
                      minLength={2}
                      placeholder={t('e.g. Muhammad Ali', 'مثلاً محمد علی')}
                      className="w-full rounded-xl bg-ink-900 border border-ink-700 p-3 text-xs text-white placeholder-ink-500 outline-none focus:border-brand-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink-300 mb-1">{t('Phone / WhatsApp', 'فون / واٹس ایپ')}</label>
                      <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="0300 1234567"
                        className="w-full rounded-xl bg-ink-900 border border-ink-700 p-3 text-xs text-white placeholder-ink-500 outline-none focus:border-brand-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-300 mb-1">{t('City', 'شہر')}</label>
                      <select name="city" className="w-full rounded-xl bg-ink-900 border border-ink-700 p-3 text-xs text-white outline-none focus:border-brand-600">
                        {cities.map((c) => (
                          <option key={c.en} value={c.en}>{t(c.en, c.ur)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-300 mb-1">{t('Email', 'ای میل')}</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl bg-ink-900 border border-ink-700 p-3 text-xs text-white placeholder-ink-500 outline-none focus:border-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-300 mb-1">{t('Primary Skill Trade', 'بنیادی ہنر')}</label>
                    <select name="trade" className="w-full rounded-xl bg-ink-900 border border-ink-700 p-3 text-xs text-white outline-none focus:border-brand-600">
                      {trades.map((tr) => (
                        <option key={tr.value} value={tr.value}>{t(tr.en, tr.ur)}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={lead.sending}
                    className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    {t('Submit Registration', 'رجسٹریشن جمع کروائیں')} &rarr;
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
