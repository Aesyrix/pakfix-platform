'use client';

import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function PrivacyContent() {
  const t = useT();
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Privacy Policy', 'رازداری کی پالیسی') }]}
        title={t('Privacy Policy', 'رازداری کی پالیسی')}
        subtitle={t('Last updated: January 2026', 'آخری تازہ کاری: جنوری 2026')}
      />
      <section className="py-12 sm:py-20 bg-white">
        <Container size="narrow">
          <div className="prose max-w-none text-xs sm:text-sm text-[#475467] leading-relaxed space-y-6">
            <h2 className="text-lg font-bold text-[#161616]">{t('1. Data We Collect', '1. ہم کون سا ڈیٹا جمع کرتے ہیں')}</h2>
            <p>
              {t('When you use PakFix, we collect information you provide directly, such as your name, phone number, address, and problem descriptions or photos uploaded for AI diagnosis.', 'جب آپ پاک فکس استعمال کرتے ہیں، ہم آپ کے براہِ راست فراہم کردہ معلومات جمع کرتے ہیں، جیسے آپ کا نام، فون نمبر، پتہ، اور اے آئی تشخیص کے لیے اپ لوڈ کردہ مسئلے کی تفصیل یا تصاویر۔')}
            </p>
            <h2 className="text-lg font-bold text-[#161616]">{t('2. How We Use Your Data', '2. ہم آپ کا ڈیٹا کیسے استعمال کرتے ہیں')}</h2>
            <p>
              {t('We use your data solely to connect you with verified local service professionals, process repair requests, provide AI diagnostic feedback, and improve platform safety.', 'ہم آپ کا ڈیٹا صرف آپ کو تصدیق شدہ مقامی سروس پروفیشنلز سے جوڑنے، مرمت کی درخواستیں پراسیس کرنے، اے آئی تشخیصی رائے فراہم کرنے اور پلیٹ فارم کی حفاظت بہتر بنانے کے لیے استعمال کرتے ہیں۔')}
            </p>
            <h2 className="text-lg font-bold text-[#161616]">{t('3. Data Protection', '3. ڈیٹا کا تحفظ')}</h2>
            <p>
              {t('We implement industry-standard encryption to protect your personal details and will never sell your personal information to third-party advertisers.', 'ہم آپ کی ذاتی تفصیلات کے تحفظ کے لیے صنعت کے معیاری انکرپشن کو نافذ کرتے ہیں اور آپ کی ذاتی معلومات کبھی تیسرے فریق کے اشتہاریوں کو فروخت نہیں کریں گے۔')}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
