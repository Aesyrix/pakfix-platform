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
        title={t('Reinventing Home Repairs for Pakistan', 'پاکستان کے لیے گھریلو مرمت کو نئے سرے سے متعارف')}
        subtitle={t('PakFix was built to solve the frustration of unreliable home repairs, hidden fees, and safety concerns.', 'پاک فکس غیر قابلِ اعتماد گھریلو مرمت، چھپی فیسوں اور حفاظتی خدشات کے مسئلے کو حل کرنے کے لیے بنایا گیا۔')}
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8 text-sm sm:text-base text-[#475467] leading-relaxed">
            <h2 className="text-2xl font-extrabold text-[#161616]">{t('Our Mission', 'ہمارا مشن')}</h2>
            <p>
              {t('Finding a trusted electrician, plumber, or AC mechanic in Pakistani cities used to mean relying on word-of-mouth or dealing with unverified workers who overcharge. PakFix combines cutting-edge AI technology with local technician verification to deliver transparent, reliable, and safe home services.', 'پاکستانی شہروں میں قابلِ اعتماد الیکٹریشن، پلمبر یا اے سی مکینک تلاش کرنے کا مطلب زبانی باتوں پر انحصار یا غیر تصدیق شدہ مزدوروں سے نمٹنا ہوتا تھا جو زیادہ پیسے لیتے ہیں۔ پاک فکس جدید اے آئی ٹیکنالوجی کو مقامی ٹیکنیشن تصدیق کے ساتھ جوڑ کر شفاف، قابلِ اعتماد اور محفوظ گھریلو خدمات فراہم کرتا ہے۔')}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 my-10 text-center">
              <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                <Sparkles className="h-8 w-8 text-[#00824A] mx-auto" />
                <h3 className="font-bold text-[#161616] text-sm">{t('AI Innovation', 'اے آئی جدت')}</h3>
                <p className="text-xs text-[#667085]">{t('Instant diagnostic guidance in English & Roman Urdu.', 'انگریزی اور رومن اردو میں فوری تشخیصی رہنمائی۔')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                <ShieldCheck className="h-8 w-8 text-[#00824A] mx-auto" />
                <h3 className="font-bold text-[#161616] text-sm">{t('100% Verification', '100% تصدیق')}</h3>
                <p className="text-xs text-[#667085]">{t('CNIC checked & skill-audited local technicians.', 'شناختی کارڈ سے جانچے گئے اور مہارت جانچے گئے مقامی ٹیکنیشن۔')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                <Heart className="h-8 w-8 text-[#00824A] mx-auto" />
                <h3 className="font-bold text-[#161616] text-sm">{t('Made for Pakistan', 'پاکستان کے لیے بنایا گیا')}</h3>
                <p className="text-xs text-[#667085]">{t('Serving Islamabad, Rawalpindi, Lahore, Karachi & beyond.', 'اسلام آباد، راولپنڈی، لاہور، کراچی اور اس سے آگے خدمات۔')}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
