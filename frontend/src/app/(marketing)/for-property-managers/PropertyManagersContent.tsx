'use client';

import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function PropertyManagersContent() {
  const t = useT();
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('For Property Managers', 'پراپرٹی مینیجرز کے لیے') }]}
        title={t('Multi-Property Maintenance Portal', 'ملٹی پراپرٹی مینٹیننس پورٹل')}
        subtitle={t('Manage repairs across residential & commercial rental properties with centralized invoicing and verified technicians.', 'مرکزی انوائسنگ اور تصدیق شدہ ٹیکنیشنز کے ساتھ رہائشی اور تجارتی کرائے کی جائیدادوں میں مرمت کا انتظام کریں۔')}
      />
      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="bg-[#F8FAF9] rounded-3xl p-8 sm:p-12 border border-[#E5E7EB] text-center space-y-6">
            <Home className="h-12 w-12 text-[#00824A] mx-auto" />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
              {t('Streamline Tenant Repairs & Maintenance', 'کرایہ داروں کی مرمت اور دیکھ بھال کو ہموار کریں')}
            </h2>
            <p className="text-sm text-[#475467] max-w-xl mx-auto">
              {t('Track work orders across 5, 20, or 100+ properties with complete job audit trails and transparent PKR billing.', 'مکمل جاب آڈٹ ٹریلز اور شفاف روپے بلنگ کے ساتھ 5، 20 یا 100+ جائیدادوں میں ورک آرڈرز ٹریک کریں۔')}
            </p>
            <div>
              <Link
                href="/home-maintenance"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all"
              >
                <span>{t('Add Your Properties', 'اپنی جائیدادیں شامل کریں')}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
