'use client';

import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function TermsContent() {
  const t = useT();
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Terms of Service', 'سروس کی شرائط') }]}
        title={t('Terms of Service', 'سروس کی شرائط')}
        subtitle={t('Last updated: January 2026', 'آخری تازہ کاری: جنوری 2026')}
      />
      <section className="py-12 sm:py-20 bg-white">
        <Container size="narrow">
          <div className="prose max-w-none text-xs sm:text-sm text-[#475467] leading-relaxed space-y-6">
            <h2 className="text-lg font-bold text-[#161616]">{t('1. Platform Agreement', '1. پلیٹ فارم معاہدہ')}</h2>
            <p>
              {t('By accessing PakFix.pk or using our AI home diagnostic and technician booking tools, you agree to comply with these Terms of Service.', 'پاک فکس ڈاٹ پی کے تک رسائی یا ہمارے اے آئی ہوم تشخیصی اور ٹیکنیشن بکنگ ٹولز استعمال کر کے آپ ان سروس کی شرائط کی پاسداری پر رضامند ہوتے ہیں۔')}
            </p>
            <h2 className="text-lg font-bold text-[#161616]">{t('2. Service Bookings & Estimates', '2. سروس بکنگ اور تخمینے')}</h2>
            <p>
              {t('Prices shown in AI diagnostic outputs are market estimates. Final prices for labor and materials are agreed upon directly between the customer and the service professional prior to starting work.', 'اے آئی تشخیصی نتائج میں دکھائی گئی قیمتیں مارکیٹ تخمینے ہیں۔ مزدوری اور سامان کی حتمی قیمت کام شروع کرنے سے پہلے گاہک اور سروس پروفیشنل کے درمیان براہِ راست طے ہوتی ہے۔')}
            </p>
            <h2 className="text-lg font-bold text-[#161616]">{t('3. Safety Disclaimer', '3. حفاظتی دستبرداری')}</h2>
            <p>
              {t('PakFix AI provides educational guidance. For high-hazard electrical, Sui gas, or structural repairs, physical inspection by a licensed technician is strictly recommended.', 'پاک فکس اے آئی تعلیمی رہنمائی فراہم کرتا ہے۔ زیادہ خطرے والی بجلی، سوئی گیس یا ساختی مرمت کے لیے لائسنس یافتہ ٹیکنیشن سے جسمانی معائنہ سختی سے تجویز کیا جاتا ہے۔')}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
