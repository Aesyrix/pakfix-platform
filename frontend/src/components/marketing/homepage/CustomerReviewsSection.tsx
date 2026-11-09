'use client';

import { BadgeCheck, MessageSquare, Wallet } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

/** Why to trust PakFix: promises the product really keeps, not invented reviews. */
export function CustomerReviewsSection() {
  const t = useT();
  const promises = [
    {
      icon: <Wallet className="h-6 w-6 text-brand-600" />,
      title: t('You approve every price', 'ہر قیمت کی منظوری آپ دیتے ہیں'),
      body: t(
        'Compare offers and choose the one you like. If the price changes on site, work continues only after you approve it.',
        'آفرز کا موازنہ کر کے اپنی پسند کی آفر چنیں۔ موقع پر قیمت بدلے تو آپ کی منظوری کے بعد ہی کام آگے بڑھتا ہے۔'
      ),
    },
    {
      icon: <BadgeCheck className="h-6 w-6 text-brand-600" />,
      title: t('Only verified professionals', 'صرف تصدیق شدہ پروفیشنلز'),
      body: t(
        'Only professionals whose CNIC and selfie our team has reviewed can send you an offer.',
        'صرف وہی پروفیشنلز آپ کو آفر بھیج سکتے ہیں جن کا شناختی کارڈ اور سیلفی ہماری ٹیم نے جانچی ہو۔'
      ),
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-brand-600" />,
      title: t('Your number stays private', 'آپ کا نمبر محفوظ رہتا ہے'),
      body: t(
        'Talk to your professional in the app, follow every step of the job, and rate the work when it is done.',
        'ایپ میں اپنے پروفیشنل سے بات کریں، کام کا ہر مرحلہ دیکھیں اور مکمل ہونے پر ریٹنگ دیں۔'
      ),
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-surface-muted border-b border-line">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{t('Customer Trust', 'گاہکوں کا اعتماد')}</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink-900">
            {t('Homeowners deserve a simpler repair experience.', 'گھر مالکان آسان مرمت کے تجربے کے حقدار ہیں۔')}
          </h2>
          <p className="text-sm text-ink-600">
            {t('PakFix is built around what matters most when someone comes to work in your home.', 'پاک فکس اس بات کو سامنے رکھ کر بنایا گیا ہے کہ آپ کے گھر کام ہو تو سب سے اہم کیا ہے۔')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {promises.map((promise) => (
            <div
              key={promise.title}
              className="bg-white rounded-2xl border border-line p-6 shadow-2xs hover:shadow-card transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 border border-brand-200">{promise.icon}</div>
              <h3 className="mt-4 text-sm font-bold text-ink-900">{promise.title}</h3>
              <p className="mt-2 text-xs text-ink-600 leading-relaxed">{promise.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
