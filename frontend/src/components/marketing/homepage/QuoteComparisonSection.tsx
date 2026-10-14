'use client';

import Link from 'next/link';
import { Star, CheckCircle2, ArrowRight, Calculator } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function QuoteComparisonSection() {
  const t = useT();
  const quotes = [
    {
      pro: 'TechFix Services',
      rating: 4.9,
      reviews: 110,
      visitFee: 'PKR 500',
      labour: 'PKR 2,000',
      materials: 'PKR 1,500',
      total: 'PKR 4,000',
      ten: '1-2 Hours',
      tur: '1-2 گھنٹے',
      ben: 'Recommended',
      bur: 'تجویز کردہ',
    },
    {
      pro: 'HomeCare Pros',
      rating: 4.8,
      reviews: 95,
      visitFee: 'PKR 500',
      labour: 'PKR 2,500',
      materials: 'PKR 1,500',
      total: 'PKR 4,500',
      ten: '2-3 Hours',
      tur: '2-3 گھنٹے',
      ben: 'Fast Arrival',
      bur: 'فوری آمد',
    },
    {
      pro: 'Lahore Repairs',
      rating: 4.7,
      reviews: 78,
      visitFee: 'PKR 700',
      labour: 'PKR 2,000',
      materials: 'PKR 1,000',
      total: 'PKR 3,700',
      ten: '2 Hours',
      tur: '2 گھنٹے',
      ben: 'Lowest Cost',
      bur: 'کم ترین لاگت',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Transparent Pricing', 'شفاف قیمت')}</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            {t('Compare before you choose.', 'انتخاب سے پہلے موازنہ کریں۔')}
          </h2>
          <p className="text-sm text-[#475467]">
            {t('Receive multiple itemized quotes for labor and materials. Pick the offer that matches your budget and timeline.', 'مزدوری اور مواد کے لیے متعدد تفصیلی تخمینے موصول کریں۔ وہ آفر چنیں جو آپ کے بجٹ اور وقت سے میل کھائے۔')}
          </p>
        </div>

        {/* Side by Side Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {quotes.map((q) => (
            <div
              key={q.pro}
              className="bg-[#F8FAF9] rounded-2xl border border-[#E5E7EB] hover:border-[#00824A] p-6 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EAF7F0] text-[#006838]">
                    {t(q.ben, q.bur)}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#161616]">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{q.rating} ({q.reviews})</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#161616] mb-4">{q.pro}</h3>

                {/* Price Itemization */}
                <div className="space-y-2 text-xs border-t border-b border-[#E5E7EB] py-3 my-3">
                  <div className="flex justify-between text-[#667085]">
                    <span>{t('Inspection / Visit Fee', 'معائنہ / وزٹ فیس')}</span>
                    <span className="font-semibold text-[#161616]">{q.visitFee}</span>
                  </div>
                  <div className="flex justify-between text-[#667085]">
                    <span>{t('Labour Charges', 'مزدوری کے چارجز')}</span>
                    <span className="font-semibold text-[#161616]">{q.labour}</span>
                  </div>
                  <div className="flex justify-between text-[#667085]">
                    <span>{t('Estimated Materials', 'تخمینی مواد')}</span>
                    <span className="font-semibold text-[#161616]">{q.materials}</span>
                  </div>
                  <div className="flex justify-between text-[#667085]">
                    <span>{t('Estimated Time', 'تخمینی وقت')}</span>
                    <span className="font-semibold text-[#161616]">{t(q.ten, q.tur)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-[#667085]">{t('Estimated Total', 'تخمینی کل')}</span>
                  <span className="text-lg font-extrabold text-[#00824A]">{q.total}</span>
                </div>
              </div>

              <Link
                href="#quick-booking"
                className="mt-6 w-full py-2.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold text-center transition-colors block shadow-2xs"
              >
                {t('Accept Quote & Book', 'تخمینہ قبول کریں اور بک کریں')}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
