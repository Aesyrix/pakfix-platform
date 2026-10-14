'use client';

import { Phone, Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function ContactContent() {
  const t = useT();
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Contact Us', 'ہم سے رابطہ') }]}
        title={t('We are here to help', 'ہم مدد کے لیے حاضر ہیں')}
        subtitle={t('Have a question about a booking, service price, or AI diagnosis? Reach out to our team anytime.', 'بکنگ، سروس قیمت یا اے آئی تشخیص کے بارے میں کوئی سوال ہے؟ کسی بھی وقت ہماری ٹیم سے رابطہ کریں۔')}
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Direct Channels', 'براہِ راست ذرائع')}</span>
              <h2 className="text-2xl font-extrabold text-[#161616]">{t('Get in touch with PakFix', 'پاک فکس سے رابطہ کریں')}</h2>
              <p className="text-sm text-[#475467] leading-relaxed">
                {t('Our support desk is operational 7 days a week to assist Pakistani households and service professionals.', 'ہمارا سپورٹ ڈیسک پاکستانی گھرانوں اور سروس پروفیشنلز کی مدد کے لیے ہفتے کے ساتوں دن فعال ہے۔')}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <Phone className="h-5 w-5 text-[#00824A] mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#161616]">{t('Helpline Phone', 'ہیلپ لائن فون')}</h3>
                    <p className="text-sm font-extrabold text-[#00824A]" dir="ltr">+92 300 123 4567</p>
                    <p className="text-[11px] text-[#667085]">{t('Available 8:00 AM – 10:00 PM', 'صبح 8:00 سے رات 10:00 تک دستیاب')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <MessageSquare className="h-5 w-5 text-[#00824A] mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#161616]">{t('WhatsApp Support', 'واٹس ایپ سپورٹ')}</h3>
                    <p className="text-sm font-extrabold text-[#00824A]" dir="ltr">+92 345 987 6543</p>
                    <p className="text-[11px] text-[#667085]">{t('Instant WhatsApp chat support', 'فوری واٹس ایپ چیٹ سپورٹ')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <Mail className="h-5 w-5 text-[#00824A] mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#161616]">{t('Email Address', 'ای میل ایڈریس')}</h3>
                    <p className="text-sm font-semibold text-[#161616]" dir="ltr">support@pakfix.pk</p>
                    <p className="text-[11px] text-[#667085]">{t('Replies within 2 hours', '2 گھنٹے کے اندر جواب')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <MapPin className="h-5 w-5 text-[#00824A] mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#161616]">{t('Head Office', 'مرکزی دفتر')}</h3>
                    <p className="text-xs text-[#475467]">{t('Sector F-8 Markaz, Islamabad, Pakistan', 'سیکٹر F-8 مرکز، اسلام آباد، پاکستان')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <form className="bg-[#F8FAF9] rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card space-y-4">
                <h3 className="text-lg font-bold text-[#161616]">{t('Send Us a Message', 'ہمیں پیغام بھیجیں')}</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#161616] mb-1">{t('Your Name', 'آپ کا نام')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('e.g. Usman Malik', 'مثلاً عثمان ملک')}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#161616] mb-1">{t('Phone Number', 'فون نمبر')}</label>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1">{t('Email Address', 'ای میل ایڈریس')}</label>
                  <input
                    type="email"
                    required
                    placeholder="usman@example.com"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1">{t('Subject', 'موضوع')}</label>
                  <select className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]">
                    <option value="Booking Question">{t('Booking & Service Inquiry', 'بکنگ اور سروس استفسار')}</option>
                    <option value="AI Diagnosis Help">{t('AI Diagnosis Assistance', 'اے آئی تشخیص معاونت')}</option>
                    <option value="Pro Onboarding">{t('Technician Onboarding', 'ٹیکنیشن آن بورڈنگ')}</option>
                    <option value="Corporate Partnership">{t('Corporate & B2B Partnership', 'کارپوریٹ اور B2B شراکت')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1">{t('Message', 'پیغام')}</label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t('How can we help you?', 'ہم آپ کی کیسے مدد کر سکتے ہیں؟')}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{t('Send Support Message', 'سپورٹ پیغام بھیجیں')}</span>
                </button>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
