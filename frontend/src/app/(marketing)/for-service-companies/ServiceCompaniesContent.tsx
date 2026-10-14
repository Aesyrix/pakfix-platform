'use client';

import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function ServiceCompaniesContent() {
  const t = useT();
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('For Service Companies', 'سروس کمپنیوں کے لیے') }]}
        title={t('Enterprise Service Company Portal', 'انٹرپرائز سروس کمپنی پورٹل')}
        subtitle={t('Manage teams of technicians, assign local job leads, issue automated digital quotes, and grow your revenue.', 'ٹیکنیشنز کی ٹیمیں سنبھالیں، مقامی جاب لیڈز تفویض کریں، خودکار ڈیجیٹل کوٹ جاری کریں اور اپنی آمدنی بڑھائیں۔')}
      />
      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="bg-[#161616] text-white rounded-3xl p-8 sm:p-12 border border-gray-800 text-center space-y-6">
            <Building2 className="h-12 w-12 text-[#00A85B] mx-auto" />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {t('Scale Your Home Service Enterprise', 'اپنا گھریلو سروس انٹرپرائز بڑھائیں')}
            </h2>
            <p className="text-sm text-gray-300 max-w-xl mx-auto">
              {t('Register your company on PakFix to unlock multi-technician dispatch, corporate invoicing, and lead management.', 'ملٹی ٹیکنیشن ڈسپیچ، کارپوریٹ انوائسنگ اور لیڈ مینجمنٹ کے لیے اپنی کمپنی پاک فکس پر رجسٹر کریں۔')}
            </p>
            <div>
              <Link
                href="/become-a-technician"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all"
              >
                <span>{t('Register Your Service Company', 'اپنی سروس کمپنی رجسٹر کریں')}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
