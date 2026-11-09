'use client';

import Link from 'next/link';
import { Wrench, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function ForProfessionalsSection() {
  const t = useT();
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-line">
      <Container>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Individual Professionals */}
          <div className="bg-ink-900 text-white rounded-3xl p-8 space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {t('Are you a skilled service professional?', 'کیا آپ ہنرمند سروس پروفیشنل ہیں؟')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-300 leading-relaxed">
                {t('Join PakFix to connect directly with homeowners looking for quality plumbing, electrical, AC and home repair services.', 'پاک فکس جوائن کریں اور معیاری پلمبنگ، الیکٹریکل، اے سی اور گھریلو مرمت کی خدمات کے خواہشمند گھر مالکان سے براہِ راست جڑیں۔')}
              </p>

              <ul className="space-y-2 text-xs text-ink-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>{t('Create verified professional profile', 'تصدیق شدہ پروفیشنل پروفائل بنائیں')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>{t('Receive service requests in your area', 'اپنے علاقے میں سروس درخواستیں موصول کریں')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>{t('Send quotes and build customer reviews', 'تخمینے بھیجیں اور گاہکوں کے ریویو بنائیں')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/become-a-technician"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
              >
                {t('Join as Professional', 'پروفیشنل کے طور پر شامل ہوں')}
              </Link>
            </div>
          </div>

          {/* Card 2: Service Companies */}
          <div className="bg-surface-muted rounded-3xl p-8 border border-line space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-accent-600 text-white flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-ink-900">
                {t('Register your service company', 'اپنی سروس کمپنی رجسٹر کریں')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                {t('Manage teams of technicians, assign job requests, issue invoices, and track revenue across Pakistan.', 'ٹیکنیشنز کی ٹیمیں سنبھالیں، جاب درخواستیں تفویض کریں، انوائس جاری کریں، اور پاکستان بھر میں آمدنی ٹریک کریں۔')}
              </p>

              <ul className="space-y-2 text-xs text-ink-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  <span>{t('Team management & technician dispatch', 'ٹیم مینجمنٹ اور ٹیکنیشن ڈسپیچ')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  <span>{t('Automated quotes & customer messaging', 'خودکار تخمینے اور گاہک پیغام رسانی')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  <span>{t('Corporate analytics dashboard', 'کارپوریٹ تجزیاتی ڈیش بورڈ')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                href="/for-service-companies"
                className="px-6 py-3 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold transition-colors inline-block"
              >
                {t('Register Your Company', 'اپنی کمپنی رجسٹر کریں')}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
