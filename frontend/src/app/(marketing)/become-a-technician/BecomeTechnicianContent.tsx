'use client';

import {
  Wrench,
  ShieldCheck,
  DollarSign,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
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
        en: 'Get alerts for jobs near you, in your working hours, on your phone.',
        ur: 'اپنے کام کے اوقات میں قریبی کاموں کی اطلاع اپنے فون پر پائیں۔',
      },
    },
    {
      icon: DollarSign,
      title: { en: 'Transparent Earnings', ur: 'شفاف آمدنی' },
      desc: {
        en: 'Send your own offer for each job, with your visit fee, labour and materials. Joining is free at launch; later a small commission on completed jobs will apply, and you will be told before it starts.',
        ur: 'ہر کام کے لیے اپنی آفر بھیجیں، وزٹ فیس، مزدوری اور سامان کے ساتھ۔ آغاز پر شامل ہونا مفت ہے؛ بعد میں مکمل کاموں پر معمولی کمیشن لاگو ہوگا، اور شروع ہونے سے پہلے آپ کو بتا دیا جائے گا۔',
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
        en: 'Choose your services, working hours and whether you take emergency jobs. Pause any time.',
        ur: 'اپنی خدمات، کام کے اوقات اور ہنگامی کام لینے کا انتخاب کریں۔ جب چاہیں وقفہ لیں۔',
      },
    },
  ];

  const cities = [
    { en: 'Islamabad', ur: 'اسلام آباد' },
    { en: 'Rawalpindi', ur: 'راولپنڈی' },
  ];

  const trades = [
    { value: 'Plumber', en: 'Plumber & Drainage', ur: 'پلمبر اور نکاسی آب' },
    { value: 'Electrician', en: 'Electrician & UPS Specialist', ur: 'الیکٹریشن اور یو پی ایس ماہر' },
    { value: 'AC Mechanic', en: 'AC Technician & Service', ur: 'اے سی ٹیکنیشن اور سروس' },
    { value: 'Appliance Tech', en: 'Appliance Care', ur: 'آلات کی دیکھ بھال' },
    { value: 'Solar Installer', en: 'Solar Panel Setup', ur: 'سولر پینل سیٹ اپ' },
    { value: 'Car or Bike Mechanic', en: 'Car or Bike Mechanic', ur: 'کار یا بائیک مکینک' },
    { value: 'Electronics Repair', en: 'TV, Laptop or Phone Repair', ur: 'ٹی وی، لیپ ٹاپ یا فون مرمت' },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Become a Pro', 'پروفیشنل بنیں') }]}
        eyebrow={
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
            <UserCheck className="h-3.5 w-3.5 text-brand-600" />
            {t('Join PakFix as a Pro', 'بطور پروفیشنل پاک فکس میں شامل ہوں')}
          </div>
        }
        title={t('Grow Your Service Business', 'اپنا سروس کاروبار بڑھائیں')}
        subtitle={t('Are you a plumber, electrician, AC or appliance technician, car or bike mechanic, or electronics repairer? Join PakFix to get jobs from customers in Islamabad and Rawalpindi.', 'کیا آپ پلمبر، الیکٹریشن، اے سی یا آلات کے ٹیکنیشن، کار یا بائیک مکینک، یا الیکٹرانکس کی مرمت کرنے والے ہیں؟ اسلام آباد اور راولپنڈی کے کسٹمرز سے کام پانے کے لیے پاک فکس میں شامل ہوں۔')}
      />

      <section className="py-12 sm:py-20 bg-surface">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow">{t('Why Join PakFix?', 'پاک فکس کیوں جوائن کریں؟')}</span>
              <h2 className="section-title text-ink-900">
                {t('Everything you need to succeed as a professional.', 'ایک پروفیشنل کے طور پر کامیابی کے لیے ہر ضروری چیز۔')}
              </h2>
              <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
                {t('PakFix brings customers near you to your phone, so you can focus on the work.', 'پاک فکس قریبی کسٹمرز کو آپ کے فون تک لاتا ہے، تاکہ آپ کام پر توجہ دے سکیں۔')}
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
              <div className="relative isolate overflow-hidden bg-premium-dark text-white rounded-3xl p-8 border border-white/10 shadow-floating space-y-6">
                <div>
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">{t('Fast Onboarding', 'تیز آن بورڈنگ')}</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{t('Prefer a call first?', 'پہلے کال چاہتے ہیں؟')}</h3>
                  <p className="text-xs text-ink-400 mt-1">{t('Leave your number and the PakFix team will call you to help you sign up.', 'اپنا نمبر چھوڑیں، پاک فکس ٹیم سائن اپ میں مدد کے لیے آپ کو کال کرے گی۔')}</p>
                </div>

                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-xl bg-brand-solid px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-brand-solid-hover"
                >
                  {t('Create your professional account', 'اپنا پروفیشنل اکاؤنٹ بنائیں')}
                </Link>
                <p className="text-center text-xs text-ink-400">
                  {t('Choose "I am a professional" when you sign up, then add your CNIC and a selfie.', 'سائن اپ کرتے وقت "میں ایک پروفیشنل ہوں" منتخب کریں، پھر اپنا شناختی کارڈ اور سیلفی شامل کریں۔')}
                </p>
                <div className="h-px bg-white/10" aria-hidden="true" />
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
                    className="w-full py-3.5 rounded-xl bg-brand-solid hover:bg-brand-solid-hover text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
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
