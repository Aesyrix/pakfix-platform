'use client';

import { type FormEvent } from 'react';
import { ArrowUpRight, AtSign, CheckCircle2, ChevronDown, Mail, MessageSquare, Phone, Send, Tag, User } from 'lucide-react';
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

      <section className="py-16 sm:py-24 bg-section-glow">
        <Container>
          <div className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left: dark brand panel */}
            <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-premium-dark p-8 text-white shadow-floating sm:p-10 lg:col-span-5">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark" />
              <div aria-hidden="true" className="absolute -bottom-24 -right-20 -z-10 h-72 w-72 rounded-full bg-brand-500/30 blur-[100px]" />
              <Mail aria-hidden="true" className="absolute -right-8 top-1/3 -z-10 h-56 w-56 rotate-[-12deg] text-white/[0.04]" />

              <div className="flex h-full flex-col">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-brand-on-dark backdrop-blur-sm">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-on-dark" />
                  {t('Direct Channels', 'براہِ راست ذرائع')}
                </span>
                <h2 className="mt-5 section-title text-white">{t('Get in touch with PakFix', 'پاک فکس سے رابطہ کریں')}</h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-300">
                  {t('Send us a message and the PakFix team will get back to you.', 'ہمیں پیغام بھیجیں، پاک فکس ٹیم آپ سے رابطہ کرے گی۔')}
                </p>

                <a
                  href="mailto:support@pakfix.pk"
                  className="group mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md transition-colors hover:border-brand-on-dark/40 hover:bg-white/[0.09] lg:mt-auto"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-500/30">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-[0.06em] text-ink-300">{t('Email Address', 'ای میل ایڈریس')}</span>
                    <span className="block truncate font-display text-lg font-bold text-white" dir="ltr">support@pakfix.pk</span>
                    <span className="block text-xs text-ink-300">{t('We reply by email', 'ہم ای میل پر جواب دیتے ہیں')}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-on-dark transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-7">
              <form onSubmit={submit} className="h-full space-y-5 rounded-3xl border border-line bg-surface p-6 shadow-lifted sm:p-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <Send className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-xl font-bold text-ink-900">{t('Send Us a Message', 'ہمیں پیغام بھیجیں')}</h3>
                </div>
                {lead.sent ? (
                  <p role="status" className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-sm font-semibold text-brand-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {t('Thank you! Your message has reached the PakFix team.', 'شکریہ! آپ کا پیغام پاک فکس ٹیم تک پہنچ گیا ہے۔')}
                  </p>
                ) : null}
                {lead.error ? <p role="alert" className="rounded-xl bg-danger-50 p-3.5 text-sm font-medium text-danger-700">{lead.error}</p> : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="contact-name" label={t('Your Name', 'آپ کا نام')} icon={User}>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      minLength={2}
                      autoComplete="name"
                      placeholder={t('e.g. Usman Malik', 'مثلاً عثمان ملک')}
                      className={FIELD}
                    />
                  </Field>
                  <Field id="contact-phone" label={t('Phone Number', 'فون نمبر')} icon={Phone}>
                    <input id="contact-phone" name="phone" type="tel" required autoComplete="tel" placeholder="0300 1234567" className={FIELD} />
                  </Field>
                </div>

                <Field id="contact-email" label={t('Email Address', 'ای میل ایڈریس')} icon={AtSign}>
                  <input id="contact-email" name="email" type="email" required autoComplete="email" placeholder="usman@example.com" className={FIELD} />
                </Field>

                <Field id="contact-subject" label={t('Subject', 'موضوع')} icon={Tag}>
                  <select id="contact-subject" name="subject" className={`${FIELD} cursor-pointer appearance-none pe-10`}>
                    <option value="Booking Question">{t('Booking & Service Inquiry', 'بکنگ اور سروس استفسار')}</option>
                    <option value="AI Diagnosis Help">{t('AI Diagnosis Assistance', 'اے آئی تشخیص معاونت')}</option>
                    <option value="Pro Onboarding">{t('Technician Onboarding', 'ٹیکنیشن آن بورڈنگ')}</option>
                    <option value="Corporate Partnership">{t('Corporate & B2B Partnership', 'کارپوریٹ اور B2B شراکت')}</option>
                  </select>
                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                </Field>

                <Field id="contact-message" label={t('Message', 'پیغام')} icon={MessageSquare} top>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    minLength={10}
                    placeholder={t('How can we help you?', 'ہم آپ کی کیسے مدد کر سکتے ہیں؟')}
                    className={`${FIELD} resize-none py-3`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={lead.sending}
                  className="group flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-button)] bg-brand-solid text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:bg-brand-solid-hover disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden="true" />
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

const FIELD =
  'w-full min-h-12 rounded-xl border border-line bg-surface ps-11 pe-3.5 text-sm text-ink-900 outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

/** A labelled form field with an icon inside the input. */
function Field({
  id,
  label,
  icon: Icon,
  top = false,
  children,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  top?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-900">
        {label}
      </label>
      <div className="group/field relative">
        <Icon
          aria-hidden="true"
          className={`pointer-events-none absolute start-3.5 h-4 w-4 text-ink-400 transition-colors group-focus-within/field:text-brand-600 ${top ? 'top-3.5' : 'top-1/2 -translate-y-1/2'}`}
        />
        {children}
      </div>
    </div>
  );
}
