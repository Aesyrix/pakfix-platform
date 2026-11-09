'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { contactApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/client';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function QuickBookingFormSection() {
  const t = useT();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Plumbing',
    city: 'Islamabad',
    address: '',
    preferred_date: '',
    preferred_time: 'Morning (9 AM - 12 PM)',
    description: '',
    urgency: 'Normal',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const services = [
    { en: 'Plumbing', ur: 'پلمبنگ' },
    { en: 'Electrical Repair', ur: 'الیکٹریکل مرمت' },
    { en: 'AC Repair & Service', ur: 'اے سی مرمت اور سروس' },
    { en: 'Appliance Repair', ur: 'آلات کی مرمت' },
    { en: 'Home Cleaning', ur: 'گھریلو صفائی' },
    { en: 'Carpentry', ur: 'بڑھئی کا کام' },
    { en: 'Painting', ur: 'پینٹنگ' },
    { en: 'Solar Installation', ur: 'سولر انسٹالیشن' },
    { en: 'Pest Control', ur: 'کیڑوں پر قابو' },
  ];

  const cities = [
    { en: 'Islamabad', ur: 'اسلام آباد' },
    { en: 'Rawalpindi', ur: 'راولپنڈی' },
  ];

  const times = [
    { en: 'Morning (9 AM - 12 PM)', ur: 'صبح (9 بجے - 12 بجے)' },
    { en: 'Afternoon (12 PM - 4 PM)', ur: 'دوپہر (12 بجے - 4 بجے)' },
    { en: 'Evening (4 PM - 8 PM)', ur: 'شام (4 بجے - 8 بجے)' },
    { en: 'Anytime Today', ur: 'آج کسی بھی وقت' },
  ];

  const urgencies = [
    { en: 'Normal', ur: 'عام' },
    { en: 'Urgent', ur: 'فوری' },
    { en: 'Emergency', ur: 'ہنگامی' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await contactApi.send({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        topic: 'booking',
        subject: `Service request: ${formData.service} in ${formData.city}`,
        message: [
          `Service: ${formData.service}`,
          `City: ${formData.city}`,
          `Address: ${formData.address}`,
          `Preferred: ${formData.preferred_date || 'Any date'}, ${formData.preferred_time}`,
          `Urgency: ${formData.urgency}`,
          `Problem: ${formData.description}`,
        ].join('\n'),
      });
      setSuccess(true);
      setFormData({ ...formData, address: '', preferred_date: '', description: '', urgency: 'Normal' });
    } catch (e) {
      const first = e instanceof ApiError ? Object.values(e.errors)[0]?.[0] : undefined;
      if (first) {
        setError(first);
        return;
      }
      setError(t('Could not submit booking request. Please check your details and try again.', 'بکنگ درخواست جمع نہیں ہو سکی۔ براہ کرم اپنی تفصیلات چیک کریں اور دوبارہ کوشش کریں۔'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-surface border-b border-line" id="quick-booking">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-4">
            <span className="eyebrow">{t('Fast Booking', 'فوری بکنگ')}</span>
            <h2 className="section-title text-ink-900">
              {t('Know what you need?', 'جانتے ہیں کیا چاہیے؟')}<br />
              <span className="text-brand-600">{t('Book a service.', 'سروس بک کریں۔')}</span>
            </h2>
            <p className="text-sm text-ink-600 leading-relaxed">
              {t('Tell us what you need and the PakFix team will help you get it sorted by a verified professional.', 'بتائیں کیا چاہیے، پاک فکس ٹیم تصدیق شدہ پروفیشنل کے ذریعے آپ کا کام کروانے میں مدد کرے گی۔')}
            </p>

            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-ink-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>{t('Verified & skilled professionals', 'تصدیق شدہ اور ہنرمند پروفیشنلز')}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-ink-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>{t('Clear PKR prices you approve first', 'روپے میں واضح قیمت، پہلے آپ کی منظوری')}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-ink-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>{t('Follow your job step by step', 'اپنے کام کا ہر مرحلہ دیکھیں')}</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-surface-muted rounded-2xl border border-line p-6 sm:p-8 shadow-card space-y-4"
            >
              <h3 className="text-lg font-bold text-ink-900">{t('Service Booking Form', 'سروس بکنگ فارم')}</h3>

              {success ? (
                <div className="p-4 rounded-xl bg-brand-100 border border-brand-200 text-brand-700 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <p className="font-bold text-sm">{t('Request received!', 'درخواست موصول ہو گئی!')}</p>
                    <p className="mt-0.5">{t('The PakFix team will contact you about your request.', 'پاک فکس ٹیم آپ کی درخواست کے بارے میں آپ سے رابطہ کرے گی۔')}</p>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="p-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { key: 'name', type: 'text', en: 'Your Name', ur: 'آپ کا نام', hint: '' },
                  { key: 'phone', type: 'tel', en: 'Phone', ur: 'فون', hint: '0300 1234567' },
                  { key: 'email', type: 'email', en: 'Email', ur: 'ای میل', hint: 'you@example.com' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-ink-900 mb-1.5">{t(field.en, field.ur)}</label>
                    <input
                      type={field.type}
                      required
                      placeholder={field.hint}
                      value={formData[field.key as 'name' | 'phone' | 'email']}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink-900 outline-none focus:border-brand-600"
                    />
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-bold text-ink-900 mb-1.5">{t('Service Needed', 'مطلوبہ سروس')}</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink-900 outline-none focus:border-brand-600"
                  >
                    {services.map((s) => (
                      <option key={s.en} value={s.en}>{t(s.en, s.ur)}</option>
                    ))}
                  </select>
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-xs font-bold text-ink-900 mb-1.5">{t('City', 'شہر')}</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink-900 outline-none focus:border-brand-600"
                  >
                    {cities.map((c) => (
                      <option key={c.en} value={c.en}>{t(c.en, c.ur)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area / Address */}
              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1.5">{t('Area / Street Address', 'علاقہ / گلی کا پتہ')}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={t('e.g. House 45, Street 12, Sector F-8/2', 'مثلاً مکان 45، گلی 12، سیکٹر F-8/2')}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface p-3 ps-9 text-xs text-ink-900 placeholder-ink-400 outline-none focus:border-brand-600"
                  />
                  <MapPin className="h-4 w-4 text-ink-500 absolute start-3 top-3.5" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-ink-900 mb-1.5">{t('Preferred Date', 'پسندیدہ تاریخ')}</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink-900 outline-none focus:border-brand-600"
                    />
                  </div>
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-xs font-bold text-ink-900 mb-1.5">{t('Preferred Time', 'پسندیدہ وقت')}</label>
                  <select
                    value={formData.preferred_time}
                    onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink-900 outline-none focus:border-brand-600"
                  >
                    {times.map((tm) => (
                      <option key={tm.en} value={tm.en}>{t(tm.en, tm.ur)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1.5">{t('Problem Description', 'مسئلے کی تفصیل')}</label>
                <textarea
                  rows={2}
                  placeholder={t('Describe what needs fixing or specific details...', 'بیان کریں کیا ٹھیک کرانا ہے یا مخصوص تفصیلات...')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink-900 placeholder-ink-400 outline-none focus:border-brand-600 resize-none"
                />
              </div>

              {/* Urgency Selector */}
              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1.5">{t('Urgency Level', 'فوری کی سطح')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {urgencies.map((urg) => (
                    <button
                      key={urg.en}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: urg.en })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.urgency === urg.en
                          ? urg.en === 'Emergency'
                            ? 'bg-danger-solid-hover text-white'
                            : 'bg-brand-solid text-white'
                          : 'bg-surface border border-line text-ink-600 hover:bg-brand-100'
                      }`}
                    >
                      {t(urg.en, urg.ur)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-solid hover:bg-brand-solid-hover text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{t('Request a Professional', 'پروفیشنل کی درخواست کریں')}</span>
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
