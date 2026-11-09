'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Calculator } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function QuoteComparisonSection() {
  const t = useT();
  const quotes = [
    {
      pro: 'Professional A',
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
      pro: 'Professional B',
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
      pro: 'Professional C',
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
    <section className="py-16 sm:py-24 bg-surface border-b border-line">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="eyebrow">{t('Transparent Pricing', 'شفاف قیمت')}</span>
          <h2 className="section-title text-ink-900">
            {t('Compare before you choose.', 'انتخاب سے پہلے موازنہ کریں۔')}
          </h2>
          <p className="text-sm text-ink-600">
            {t('Example offers: get itemized prices for labour and materials, then pick the one that fits your budget and timeline.', 'مثالی آفرز: مزدوری اور سامان کی تفصیلی قیمتیں لیں، پھر اپنے بجٹ اور وقت کے مطابق چنیں۔')}
          </p>
        </div>

        {/* Side by Side Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {quotes.map((q) => (
            <div
              key={q.pro}
              className="bg-surface-muted rounded-2xl border border-line hover:border-brand-300 p-6 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
                    {t(q.ben, q.bur)}
                  </span>
                  <span className="text-xs font-bold text-ink-500">{t('Example', 'مثال')}</span>
                </div>

                <h3 className="text-lg font-bold text-ink-900 mb-4">{q.pro}</h3>

                {/* Price Itemization */}
                <div className="space-y-2 text-xs border-t border-b border-line py-3 my-3">
                  <div className="flex justify-between text-ink-500">
                    <span>{t('Inspection / Visit Fee', 'معائنہ / وزٹ فیس')}</span>
                    <span className="font-semibold text-ink-900">{q.visitFee}</span>
                  </div>
                  <div className="flex justify-between text-ink-500">
                    <span>{t('Labour Charges', 'مزدوری کے چارجز')}</span>
                    <span className="font-semibold text-ink-900">{q.labour}</span>
                  </div>
                  <div className="flex justify-between text-ink-500">
                    <span>{t('Estimated Materials', 'تخمینی مواد')}</span>
                    <span className="font-semibold text-ink-900">{q.materials}</span>
                  </div>
                  <div className="flex justify-between text-ink-500">
                    <span>{t('Estimated Time', 'تخمینی وقت')}</span>
                    <span className="font-semibold text-ink-900">{t(q.ten, q.tur)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-ink-500">{t('Estimated Total', 'تخمینی کل')}</span>
                  <span className="text-lg font-extrabold text-brand-600">{q.total}</span>
                </div>
              </div>

              <Link
                href="#quick-booking"
                className="mt-6 w-full py-2.5 rounded-xl bg-brand-solid hover:bg-brand-solid-hover text-white text-xs font-bold text-center transition-colors block shadow-2xs"
              >
                {t('Request a Professional', 'پروفیشنل کی درخواست کریں')}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
