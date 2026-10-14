'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function QuickBookingFormSection() {
  const t = useT();
  const [formData, setFormData] = useState({
    service: 'Plumbing',
    city: 'Lahore',
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
    { en: 'Lahore', ur: 'لاہور' },
    { en: 'Karachi', ur: 'کراچی' },
    { en: 'Faisalabad', ur: 'فیصل آباد' },
    { en: 'Peshawar', ur: 'پشاور' },
    { en: 'Multan', ur: 'ملتان' },
    { en: 'Gujranwala', ur: 'گوجرانوالہ' },
    { en: 'Sialkot', ur: 'سیالکوت' },
    { en: 'Quetta', ur: 'کوئٹہ' },
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
      // Simulate real API dispatch to /api/v1/service-requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({
        service: 'Plumbing',
        city: 'Lahore',
        address: '',
        preferred_date: '',
        preferred_time: 'Morning (9 AM - 12 PM)',
        description: '',
        urgency: 'Normal',
      });
    } catch {
      setError(t('Could not submit booking request. Please check your details and try again.', 'بکنگ درخواست جمع نہیں ہو سکی۔ براہ کرم اپنی تفصیلات چیک کریں اور دوبارہ کوشش کریں۔'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]" id="quick-booking">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Fast Booking', 'فوری بکنگ')}</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
              {t('Know what you need?', 'جانتے ہیں کیا چاہیے؟')}<br />
              <span className="text-[#00824A]">{t('Book a service.', 'سروس بک کریں۔')}</span>
            </h2>
            <p className="text-sm text-[#475467] leading-relaxed">
              {t('Fill out the details below to receive instant upfront estimates and connect with available verified service professionals in your area.', 'فوری پیشگی تخمینے حاصل کرنے اور اپنے علاقے میں دستیاب تصدیق شدہ سروس پروفیشنلز سے جڑنے کے لیے نیچے تفصیلات بھریں۔')}
            </p>

            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#161616]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7F0] text-[#00532C]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>{t('Verified & skilled professionals', 'تصدیق شدہ اور ہنرمند پروفیشنلز')}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#161616]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7F0] text-[#00532C]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>{t('Transparent PKR pricing with no surprises', 'بغیر کسی حیرت کے شفاف روپے قیمت')}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#161616]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7F0] text-[#00532C]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>{t('On-time arrival & job tracking', 'وقت پر آمد اور جاب ٹریکنگ')}</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-[#F8FAF9] rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-card space-y-4"
            >
              <h3 className="text-lg font-bold text-[#161616]">{t('Service Booking Form', 'سروس بکنگ فارم')}</h3>

              {success ? (
                <div className="p-4 rounded-xl bg-[#EAF7F0] border border-[#C2ECCF] text-[#006838] text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00824A]" />
                  <div>
                    <p className="font-bold text-sm">{t('Booking Request Sent Successfully!', 'بکنگ درخواست کامیابی سے بھیج دی گئی!')}</p>
                    <p className="mt-0.5">{t('Verified service professionals in your city will review your request and send upfront quotes shortly.', 'آپ کے شہر کے تصدیق شدہ سروس پروفیشنلز آپ کی درخواست کا جائزہ لے کر جلد پیشگی تخمینے بھیجیں گے۔')}</p>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('Service Needed', 'مطلوبہ سروس')}</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                  >
                    {services.map((s) => (
                      <option key={s.en} value={s.en}>{t(s.en, s.ur)}</option>
                    ))}
                  </select>
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('City', 'شہر')}</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                  >
                    {cities.map((c) => (
                      <option key={c.en} value={c.en}>{t(c.en, c.ur)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area / Address */}
              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('Area / Street Address', 'علاقہ / گلی کا پتہ')}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={t('e.g. House 45, Street 12, Sector F-8/2', 'مثلاً مکان 45، گلی 12، سیکٹر F-8/2')}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 ps-9 text-xs text-[#161616] placeholder-[#9CA3AF] outline-none focus:border-[#00824A]"
                  />
                  <MapPin className="h-4 w-4 text-[#667085] absolute start-3 top-3.5" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('Preferred Date', 'پسندیدہ تاریخ')}</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                    />
                  </div>
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('Preferred Time', 'پسندیدہ وقت')}</label>
                  <select
                    value={formData.preferred_time}
                    onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                  >
                    {times.map((tm) => (
                      <option key={tm.en} value={tm.en}>{t(tm.en, tm.ur)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('Problem Description', 'مسئلے کی تفصیل')}</label>
                <textarea
                  rows={2}
                  placeholder={t('Describe what needs fixing or specific details...', 'بیان کریں کیا ٹھیک کرانا ہے یا مخصوص تفصیلات...')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] placeholder-[#9CA3AF] outline-none focus:border-[#00824A] resize-none"
                />
              </div>

              {/* Urgency Selector */}
              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('Urgency Level', 'فوری کی سطح')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {urgencies.map((urg) => (
                    <button
                      key={urg.en}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: urg.en })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.urgency === urg.en
                          ? urg.en === 'Emergency'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#00824A] text-white'
                          : 'bg-white border border-[#E5E7EB] text-[#475467] hover:bg-[#EAF7F0]'
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
                className="w-full py-3 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{t('Find Available Professionals', 'دستیاب پروفیشنلز تلاش کریں')}</span>
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
