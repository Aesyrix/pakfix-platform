'use client';

import Link from 'next/link';
import { Star, CheckCircle2, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function FindProfessionalsSection() {
  const t = useT();
  const pros = [
    {
      name: 'CoolAir Services',
      slug: 'usman-tariq-karachi',
      tradeEn: 'AC / HVAC & Refrigerator Repair',
      tradeUr: 'اے سی / ایچ وی اے سی اور فریج مرمت',
      city: 'Karachi',
      cityUr: 'کراچی',
      rating: 4.9,
      reviews: 315,
      jobs: '508+ Jobs',
      jobsUr: '508+ جابز',
      exp: '7 Yrs Exp',
      expUr: '7 سال تجربہ',
      price: 'PKR 1,000 Visit Fee',
      priceUr: 'PKR 1,000 وزٹ فیس',
      status: 'Available Today',
      statusUr: 'آج دستیاب',
      initials: 'CS',
    },
    {
      name: 'Raza Electric Works',
      slug: 'ahmed-raza-lahore',
      tradeEn: 'Electrical & UPS / Inverter',
      tradeUr: 'الیکٹریکل اور یو پی ایس / انورٹر',
      city: 'Lahore',
      cityUr: 'لاہور',
      rating: 4.8,
      reviews: 133,
      jobs: '214+ Jobs',
      jobsUr: '214+ جابز',
      exp: '9 Yrs Exp',
      expUr: '9 سال تجربہ',
      price: 'PKR 1,000 Visit Fee',
      priceUr: 'PKR 1,000 وزٹ فیس',
      status: 'Available Today',
      statusUr: 'آج دستیاب',
      initials: 'RE',
    },
    {
      name: 'Anwar Woodcraft',
      slug: 'naveed-anwar-islamabad',
      tradeEn: 'Carpentry & Furniture Repair',
      tradeUr: 'بڑھئی کا کام اور فرنیچر مرمت',
      city: 'Islamabad',
      cityUr: 'اسلام آباد',
      rating: 4.7,
      reviews: 172,
      jobs: '277+ Jobs',
      jobsUr: '277+ جابز',
      exp: '15 Yrs Exp',
      expUr: '15 سال تجربہ',
      price: 'PKR 1,000 Visit Fee',
      priceUr: 'PKR 1,000 وزٹ فیس',
      status: 'Available Today',
      statusUr: 'آج دستیاب',
      initials: 'AW',
    },
    {
      name: 'Khalid Plumbing',
      slug: 'imran-khalid-lahore',
      tradeEn: 'Plumbing & Water Motor',
      tradeUr: 'پلمبنگ اور واٹر موٹر',
      city: 'Lahore',
      cityUr: 'لاہور',
      rating: 4.6,
      reviews: 211,
      jobs: '341+ Jobs',
      jobsUr: '341+ جابز',
      exp: '12 Yrs Exp',
      expUr: '12 سال تجربہ',
      price: 'PKR 1,000 Visit Fee',
      priceUr: 'PKR 1,000 وزٹ فیس',
      status: 'Available Today',
      statusUr: 'آج دستیاب',
      initials: 'KP',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Top Rated', 'اعلیٰ درجہ بندی')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616] mt-1">
              {t('Professionals you can check before you book.', 'بکنگ سے پہلے جانچنے کے قابل پروفیشنلز۔')}
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              {t('View verified profiles, real customer ratings, background status, and experience.', 'تصدیق شدہ پروفائلز، حقیقی گاہک ریٹنگ، پس منظر کی حیثیت اور تجربہ دیکھیں۔')}
            </p>
          </div>

          <Link
            href="/find-a-technician"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00824A] hover:text-[#006B3C] transition-colors"
          >
            <span>{t('Browse All Professionals', 'تمام پروفیشنلز دیکھیں')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Professionals Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pros.map((pro) => (
            <div
              key={pro.slug}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs hover:shadow-card hover:border-[#00824A] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F0] text-[#00532C] font-extrabold text-base border border-[#C2ECCF]">
                    {pro.initials}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF7F0] text-[#006838] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#00824A]" /> {t('Verified', 'تصدیق شدہ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#161616]">{pro.name}</h3>
                <p className="text-xs font-semibold text-[#00824A]">{t(pro.tradeEn, pro.tradeUr)}</p>

                <div className="flex items-center gap-1 text-xs text-[#667085] mt-1">
                  <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                  <span>{t(pro.city, pro.cityUr)}</span>
                </div>

                {/* Metrics Badges */}
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2 text-[11px] text-[#475467]">
                  <div className="flex items-center gap-1 font-bold text-[#161616]">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{pro.rating} ({pro.reviews})</span>
                  </div>
                  <div className="text-right font-medium text-[#667085]">{t(pro.jobs, pro.jobsUr)}</div>
                  <div className="font-medium text-[#667085]">{t(pro.exp, pro.expUr)}</div>
                  <div className="text-right font-bold text-[#006838]">{t(pro.price, pro.priceUr)}</div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2">
                <Link
                  href={`/professionals/${pro.slug}`}
                  className="py-2 px-3 rounded-xl border border-[#E5E7EB] text-center text-xs font-semibold text-[#161616] hover:bg-[#F8FAF9] transition-colors"
                >
                  {t('View Profile', 'پروفائل دیکھیں')}
                </Link>
                <Link
                  href="#quick-booking"
                  className="py-2 px-3 rounded-xl bg-[#00824A] text-center text-xs font-bold text-white hover:bg-[#006B3C] transition-colors shadow-2xs"
                >
                  {t('Request Quote', 'تخمینہ طلب کریں')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
