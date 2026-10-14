'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function CostEstimatorSection() {
  const t = useT();
  const [service, setService] = useState('AC Repair');
  const [city, setCity] = useState('Lahore');
  const [problemType, setProblemType] = useState('Gas Refill & Master Service');
  const [calculatedRange, setCalculatedRange] = useState('PKR 2,500 – 4,500');

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (service === 'AC Repair') setCalculatedRange('PKR 2,500 – 5,000');
    else if (service === 'Plumbing') setCalculatedRange('PKR 1,200 – 3,000');
    else if (service === 'Electrical') setCalculatedRange('PKR 1,500 – 3,500');
    else setCalculatedRange('PKR 2,000 – 6,000');
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-10 shadow-card">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold">
              <Calculator className="h-4 w-4 text-[#00824A]" />
              <span>{t('Interactive Repair Tool', 'انٹرایکٹو مرمت ٹول')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616]">
              {t('Get an estimated repair range.', 'مرمت کی تخمینی حد معلوم کریں۔')}
            </h2>
            <p className="text-xs sm:text-sm text-[#475467]">
              {t('Select your service type and issue to view standard market PKR estimates.', 'معیاری مارکیٹ روپے تخمینے دیکھنے کے لیے اپنی سروس کی قسم اور مسئلہ منتخب کریں۔')}
            </p>
          </div>

          <form onSubmit={handleEstimate} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('Service', 'سروس')}</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] p-3 text-xs font-semibold text-[#161616] outline-none"
                >
                  <option value="AC Repair">{t('AC Repair & Service', 'اے سی مرمت اور سروس')}</option>
                  <option value="Plumbing">{t('Plumbing & Pipes', 'پلمبنگ اور پائپ')}</option>
                  <option value="Electrical">{t('Electrical & DB Box', 'الیکٹریکل اور ڈی بی باکس')}</option>
                  <option value="Appliance Care">{t('Appliance Care', 'آلات کی دیکھ بھال')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('City', 'شہر')}</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] p-3 text-xs font-semibold text-[#161616] outline-none"
                >
                  <option value="Islamabad">{t('Islamabad', 'اسلام آباد')}</option>
                  <option value="Rawalpindi">{t('Rawalpindi', 'راولپنڈی')}</option>
                  <option value="Lahore">{t('Lahore', 'لاہور')}</option>
                  <option value="Karachi">{t('Karachi', 'کراچی')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">{t('Problem Type', 'مسئلے کی قسم')}</label>
                <select
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] p-3 text-xs font-semibold text-[#161616] outline-none"
                >
                  <option value="Gas Refill & Master Service">{t('Gas Refill & Master Service', 'گیس ری فل اور ماسٹر سروس')}</option>
                  <option value="Water Leakage Repair">{t('Water Leakage Repair', 'پانی کے رساؤ کی مرمت')}</option>
                  <option value="Short Circuit / Breaker">{t('Short Circuit / Breaker', 'شارٹ سرکٹ / بریکر')}</option>
                  <option value="General Inspection">{t('General Inspection', 'عمومی معائنہ')}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {t('Calculate Estimated Cost Range', 'تخمینی لاگت کی حد کا حساب لگائیں')}
            </button>
          </form>

          {/* Result Output Display */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB] bg-[#EAF7F0] p-4 rounded-2xl text-center space-y-1">
            <span className="text-xs font-bold text-[#006838]">{t('Typical Market Range for', 'عام مارکیٹ رینج برائے')} {t(city, city === 'Islamabad' ? 'اسلام آباد' : city === 'Rawalpindi' ? 'راولپنڈی' : city === 'Lahore' ? 'لاہور' : 'کراچی')}:</span>
            <div className="text-2xl font-extrabold text-[#006838]">{calculatedRange}</div>
            <p className="text-[11px] text-[#00532C] max-w-md mx-auto pt-1">
              {t('* Actual cost depends on detailed inspection, labour requirements, material parts and service provider choice.', '* اصل لاگت تفصیلی معائنہ، مزدوری کی ضرورت، مواد کے پرزے اور سروس فراہم کنندہ کے انتخاب پر منحصر ہے۔')}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
