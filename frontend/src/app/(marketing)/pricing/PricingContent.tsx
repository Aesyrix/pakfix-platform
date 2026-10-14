'use client';

import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { CostEstimatorSection } from '@/components/marketing/homepage/CostEstimatorSection';
import { useT } from '@/components/i18n/LocaleProvider';

export function PricingContent() {
  const t = useT();
  const priceGrid = [
    {
      service: { en: 'Plumbing Repair', ur: 'پلمبنگ مرمت' },
      visitFee: { en: 'PKR 500 – 1,000', ur: 'روپے 500 – 1,000' },
      labour: { en: 'PKR 1,000 – 2,500', ur: 'روپے 1,000 – 2,500' },
      time: { en: '1-2 Hours', ur: '1-2 گھنٹے' },
    },
    {
      service: { en: 'Electrical Wiring / DB', ur: 'الیکٹریکل وائرنگ / ڈی بی' },
      visitFee: { en: 'PKR 500 – 1,000', ur: 'روپے 500 – 1,000' },
      labour: { en: 'PKR 1,200 – 3,000', ur: 'روپے 1,200 – 3,000' },
      time: { en: '1-3 Hours', ur: '1-3 گھنٹے' },
    },
    {
      service: { en: 'AC Master Service', ur: 'اے سی ماسٹر سروس' },
      visitFee: { en: 'PKR 500 – 1,000', ur: 'روپے 500 – 1,000' },
      labour: { en: 'PKR 1,500 – 2,500', ur: 'روپے 1,500 – 2,500' },
      time: { en: '1-2 Hours', ur: '1-2 گھنٹے' },
    },
    {
      service: { en: 'AC Gas Refill', ur: 'اے سی گیس ری فل' },
      visitFee: { en: 'Included', ur: 'شامل' },
      labour: { en: 'PKR 3,500 – 5,500', ur: 'روپے 3,500 – 5,500' },
      time: { en: '1 Hour', ur: '1 گھنٹہ' },
    },
    {
      service: { en: 'Appliance Repair', ur: 'آلات کی مرمت' },
      visitFee: { en: 'PKR 500 – 1,200', ur: 'روپے 500 – 1,200' },
      labour: { en: 'PKR 1,500 – 4,000', ur: 'روپے 1,500 – 4,000' },
      time: { en: '1-2 Hours', ur: '1-2 گھنٹے' },
    },
    {
      service: { en: 'Water Motor Pump', ur: 'واٹر موٹر پمپ' },
      visitFee: { en: 'PKR 500 – 1,000', ur: 'روپے 500 – 1,000' },
      labour: { en: 'PKR 1,500 – 3,000', ur: 'روپے 1,500 – 3,000' },
      time: { en: '1-2 Hours', ur: '1-2 گھنٹے' },
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Pricing', 'قیمتیں') }]}
        title={t('Transparent Market Pricing', 'شفاف مارکیٹ قیمتیں')}
        subtitle={t('Upfront market price ranges for labor and inspection. Know what to expect before booking.', 'مزدوری اور معائنے کے لیے پیشگی مارکیٹ قیمت کی حدود۔ بکنگ سے پہلے جانیں کیا توقع رکھنی ہے۔')}
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Price Table Card */}
            <div className="bg-[#F8FAF9] rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-card space-y-6">
              <h2 className="text-xl font-extrabold text-[#161616]">{t('Standard Service Rate Card (PKR)', 'معیاری سروس ریٹ کارڈ (روپے)')}</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#667085] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 text-start">{t('Service', 'سروس')}</th>
                      <th className="py-3 px-4 text-start">{t('Inspection / Visit Fee', 'معائنہ / وزٹ فیس')}</th>
                      <th className="py-3 px-4 text-start">{t('Standard Labour Range', 'معیاری مزدوری کی حد')}</th>
                      <th className="py-3 px-4 text-start">{t('Est. Duration', 'تخمینہ دورانیہ')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] font-medium text-[#161616]">
                    {priceGrid.map((row) => (
                      <tr key={row.service.en} className="hover:bg-white transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#00824A]">{t(row.service.en, row.service.ur)}</td>
                        <td className="py-3.5 px-4">{t(row.visitFee.en, row.visitFee.ur)}</td>
                        <td className="py-3.5 px-4 font-bold">{t(row.labour.en, row.labour.ur)}</td>
                        <td className="py-3.5 px-4 text-[#667085]">{t(row.time.en, row.time.ur)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Calculator Component */}
            <CostEstimatorSection />
          </div>
        </Container>
      </section>
    </>
  );
}
