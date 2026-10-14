'use client';

import { ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function SafetyContent() {
  const t = useT();
  const protocols = [
    {
      title: { en: '1. CNIC & Background Checks', ur: '1. شناختی کارڈ اور پس منظر کی جانچ' },
      desc: {
        en: 'Every technician on PakFix submits verified Pakistani CNIC credentials and undergoes background checks.',
        ur: 'پاک فکس پر ہر ٹیکنیشن تصدیق شدہ پاکستانی شناختی کارڈ جمع کرواتا ہے اور پس منظر کی جانچ سے گزرتا ہے۔',
      },
    },
    {
      title: { en: '2. AI Emergency Classification', ur: '2. اے آئی ہنگامی درجہ بندی' },
      desc: {
        en: 'PakFix AI automatically flags high-risk gas leaks, electrical shorts, or structural risks and displays immediate safety instructions.',
        ur: 'پاک فکس اے آئی خودکار طور پر زیادہ خطرے والے گیس لیک، بجلی کے شارٹ یا ساختی خطرات کی نشان دہی کرتا ہے اور فوری حفاظتی ہدایات دکھاتا ہے۔',
      },
    },
    {
      title: { en: '3. Upfront Price Transparency', ur: '3. پیشگی قیمت کی شفافیت' },
      desc: {
        en: 'Technicians confirm labor & material estimates prior to starting work to eliminate disputes.',
        ur: 'ٹیکنیشن کام شروع کرنے سے پہلے مزدوری اور سامان کا تخمینہ تصدیق کرتے ہیں تاکہ تنازعات ختم ہوں۔',
      },
    },
    {
      title: { en: '4. Verified Customer Reviews', ur: '4. تصدیق شدہ گاہک ریویوز' },
      desc: {
        en: 'Only customers who completed a booking can rate and review technicians.',
        ur: 'صرف وہ گاہک جو بکنگ مکمل کر چکے ہوں ٹیکنیشنز کو ریٹ اور ریویو کر سکتے ہیں۔',
      },
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Safety', 'حفاظت') }]}
        title={t('Safety & Verification Standards', 'حفاظت اور تصدیق کے معیارات')}
        subtitle={t("Your family's safety and peace of mind are our highest priorities.", 'آپ کے خاندان کی حفاظت اور اطمینان ہماری سب سے بڑی ترجیح ہے۔')}
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {protocols.map((p) => (
              <div key={p.title.en} className="bg-[#F8FAF9] rounded-2xl p-6 border border-[#E5E7EB] space-y-3">
                <ShieldCheck className="h-8 w-8 text-[#00824A]" />
                <h3 className="text-base font-bold text-[#161616]">{t(p.title.en, p.title.ur)}</h3>
                <p className="text-xs text-[#667085] leading-relaxed">{t(p.desc.en, p.desc.ur)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
