'use client';

import { Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';

export function AboutContent() {
  const t = useT();
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('About Us', 'ہمارے بارے میں') }]}
        title={t('Reinventing Repairs for Pakistan', 'پاکستان کے لیے مرمت کو نئے سرے سے متعارف')}
        subtitle={t('PakFix was built to solve the frustration of unreliable repairs, hidden fees, and safety concerns.', 'پاک فکس غیر قابلِ اعتماد مرمت، چھپی فیسوں اور حفاظتی خدشات کے مسئلے کو حل کرنے کے لیے بنایا گیا۔')}
      />

      <section className="py-12 sm:py-20 bg-surface">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8 text-sm sm:text-base text-ink-600 leading-relaxed">
            <h2 className="text-2xl font-extrabold text-ink-900">{t('Our Mission', 'ہمارا مشن')}</h2>
            <p>
              {t('Finding a trusted electrician, plumber, or AC mechanic in Pakistani cities used to mean relying on word-of-mouth or dealing with unverified workers who overcharge. PakFix combines cutting-edge AI technology with local technician verification to deliver transparent, reliable, and safe repair services for homes, offices and businesses.', 'پاکستانی شہروں میں قابلِ اعتماد الیکٹریشن، پلمبر یا اے سی مکینک تلاش کرنے کا مطلب زبانی باتوں پر انحصار یا غیر تصدیق شدہ مزدوروں سے نمٹنا ہوتا تھا جو زیادہ پیسے لیتے ہیں۔ پاک فکس جدید اے آئی ٹیکنالوجی کو مقامی ٹیکنیشن تصدیق کے ساتھ جوڑ کر شفاف، قابلِ اعتماد اور گھروں، دفاتر اور کاروباروں کے لیے محفوظ مرمتی خدمات فراہم کرتا ہے۔')}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 my-10 text-center">
              <div className="p-6 rounded-2xl bg-surface-muted border border-line space-y-2">
                <Sparkles className="h-8 w-8 text-brand-600 mx-auto" />
                <h3 className="font-bold text-ink-900 text-sm">{t('AI Innovation', 'اے آئی جدت')}</h3>
                <p className="text-xs text-ink-500">{t('Instant diagnostic guidance in English & Roman Urdu.', 'انگریزی اور رومن اردو میں فوری تشخیصی رہنمائی۔')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-surface-muted border border-line space-y-2">
                <ShieldCheck className="h-8 w-8 text-brand-600 mx-auto" />
                <h3 className="font-bold text-ink-900 text-sm">{t('Verified Professionals', 'تصدیق شدہ پروفیشنلز')}</h3>
                <p className="text-xs text-ink-500">{t('CNIC and selfie reviewed by our team before any job.', 'کسی بھی کام سے پہلے ہماری ٹیم شناختی کارڈ اور سیلفی جانچتی ہے۔')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-surface-muted border border-line space-y-2">
                <Heart className="h-8 w-8 text-brand-600 mx-auto" />
                <h3 className="font-bold text-ink-900 text-sm">{t('Made for Pakistan', 'پاکستان کے لیے بنایا گیا')}</h3>
                <p className="text-xs text-ink-500">{t('Starting in Islamabad and Rawalpindi, growing city by city.', 'اسلام آباد اور راولپنڈی سے آغاز، پھر شہر بہ شہر توسیع۔')}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
