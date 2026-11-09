'use client';

import { type FormEvent } from 'react';
import { Mail, Send } from 'lucide-react';
import { useLeadForm } from '@/components/marketing/useLeadForm';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

const TOPICS = { 'Booking Question': 'booking', 'AI Diagnosis Help': 'general', 'Pro Onboarding': 'professional', 'Corporate Partnership': 'partnership' } as const;

export function ContactContent() {
  const t = useT();
  const lead = useLeadForm(t('Could not send your message. Please try again.', 'آپ کا پیغام نہیں بھیجا جا سکا۔ دوبارہ کوشش کریں۔'));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? '').trim();
    const subject = value('subject') as keyof typeof TOPICS;
    const ok = await lead.send({
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      topic: TOPICS[subject] ?? 'general',
      subject,
      message: value('message'),
    });
    if (ok) form.reset();
  }

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
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{t('Direct Channels', 'براہِ راست ذرائع')}</span>
              <h2 className="text-2xl font-extrabold text-ink-900">{t('Get in touch with PakFix', 'پاک فکس سے رابطہ کریں')}</h2>
              <p className="text-sm text-ink-600 leading-relaxed">
                {t('Send us a message and the PakFix team will get back to you.', 'ہمیں پیغام بھیجیں، پاک فکس ٹیم آپ سے رابطہ کرے گی۔')}
              </p>

              <div className="space-y-4 pt-2">

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-muted border border-line">
                  <Mail className="h-5 w-5 text-brand-600 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-ink-900">{t('Email Address', 'ای میل ایڈریس')}</h3>
                    <p className="text-sm font-semibold text-ink-900" dir="ltr">support@pakfix.pk</p>
                    <p className="text-[11px] text-ink-500">{t('We reply by email', 'ہم ای میل پر جواب دیتے ہیں')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <form onSubmit={submit} className="bg-surface-muted rounded-3xl p-6 sm:p-8 border border-line shadow-card space-y-4">
                <h3 className="text-lg font-bold text-ink-900">{t('Send Us a Message', 'ہمیں پیغام بھیجیں')}</h3>
                {lead.sent ? (
                  <p role="status" className="rounded-xl bg-brand-100 border border-brand-200 p-3 text-xs font-semibold text-brand-700">
                    {t('Thank you! Your message has reached the PakFix team.', 'شکریہ! آپ کا پیغام پاک فکس ٹیم تک پہنچ گیا ہے۔')}
                  </p>
                ) : null}
                {lead.error ? <p role="alert" className="rounded-xl bg-danger-50 p-3 text-xs font-medium text-danger-700">{lead.error}</p> : null}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-900 mb-1">{t('Your Name', 'آپ کا نام')}</label>
                    <input
                      name="name"
                      type="text"
                      required
                      minLength={2}
                      placeholder={t('e.g. Usman Malik', 'مثلاً عثمان ملک')}
                      className="w-full rounded-xl border border-line bg-white p-3 text-xs text-ink-900 outline-none focus:border-brand-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-900 mb-1">{t('Phone Number', 'فون نمبر')}</label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      className="w-full rounded-xl border border-line bg-white p-3 text-xs text-ink-900 outline-none focus:border-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-900 mb-1">{t('Email Address', 'ای میل ایڈریس')}</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="usman@example.com"
                    className="w-full rounded-xl border border-line bg-white p-3 text-xs text-ink-900 outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-900 mb-1">{t('Subject', 'موضوع')}</label>
                  <select name="subject" className="w-full rounded-xl border border-line bg-white p-3 text-xs text-ink-900 outline-none focus:border-brand-600">
                    <option value="Booking Question">{t('Booking & Service Inquiry', 'بکنگ اور سروس استفسار')}</option>
                    <option value="AI Diagnosis Help">{t('AI Diagnosis Assistance', 'اے آئی تشخیص معاونت')}</option>
                    <option value="Pro Onboarding">{t('Technician Onboarding', 'ٹیکنیشن آن بورڈنگ')}</option>
                    <option value="Corporate Partnership">{t('Corporate & B2B Partnership', 'کارپوریٹ اور B2B شراکت')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-900 mb-1">{t('Message', 'پیغام')}</label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    minLength={10}
                    placeholder={t('How can we help you?', 'ہم آپ کی کیسے مدد کر سکتے ہیں؟')}
                    className="w-full rounded-xl border border-line bg-white p-3 text-xs text-ink-900 outline-none focus:border-brand-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={lead.sending}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
