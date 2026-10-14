'use client';

import { RichText } from '@/components/marketing/Cards';
import { PageHeader } from '@/components/marketing/PageHeader';
import { Container } from '@/components/ui/Container';
import { useFormatDate, useT } from '@/components/i18n/LocaleProvider';

export function RefundContent({
  title,
  updatedAt,
  bodyHtml,
}: {
  title?: string | null;
  updatedAt?: string | null;
  bodyHtml?: string | null;
}) {
  const t = useT();
  const formatDate = useFormatDate();
  const updated = updatedAt ? formatDate(updatedAt) : null;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Refund Policy', 'رقم کی واپسی کی پالیسی') }]}
        title={title ?? t('Refund Policy', 'رقم کی واپسی کی پالیسی')}
        subtitle={updated ? t(`Last updated ${updated}`, `آخری تازہ کاری ${updated}`) : undefined}
        size="narrow"
      />

      <Container size="narrow" className="py-12 sm:py-16">
        {bodyHtml ? (
          <RichText html={bodyHtml} />
        ) : (
          <div className="rich-text">
            <p>
              {t('If a job is not done properly, raise a dispute from the booking within PakFix. Support reviews the evidence from both sides and can order a partial or full refund.', 'اگر کام صحیح طریقے سے نہ ہوا ہو، تو پاک فکس میں بکنگ سے تنازعہ اٹھائیں۔ سپورٹ دونوں فریقوں کے ثبوت کا جائزہ لیتا ہے اور جزوی یا مکمل رقم کی واپسی کا حکم دے سکتا ہے۔')}
            </p>
            <h2>{t('Before work starts', 'کام شروع ہونے سے پہلے')}</h2>
            <p>
              {t('Cancel a booking before the professional sets off and nothing is charged. If they have already travelled, the visit fee shown on the booking may still apply.', 'پروفیشنل کے روانہ ہونے سے پہلے بکنگ منسوخ کریں تو کچھ وصول نہیں کیا جاتا۔ اگر وہ سفر کر چکے ہوں تو بکنگ میں دکھائی گئی وزٹ فیس لاگو ہو سکتی ہے۔')}
            </p>
            <h2>{t('After work is done', 'کام مکمل ہونے کے بعد')}</h2>
            <p>
              {t('You have the chance to confirm the work. If something is wrong, raise a dispute rather than confirming, and support will look at it.', 'آپ کو کام کی تصدیق کا موقع ملتا ہے۔ اگر کچھ غلط ہو تو تصدیق کرنے کے بجائے تنازعہ اٹھائیں، اور سپورٹ اس کا جائزہ لے گا۔')}
            </p>
            <h2>{t('How refunds are paid', 'رقم کی واپسی کیسے کی جاتی ہے')}</h2>
            <p>
              {t('A refund goes back the way you paid. Cash jobs are refunded by bank transfer or Easypaisa, usually within five working days of a decision.', 'رقم اسی طریقے سے واپس کی جاتی ہے جس سے آپ نے ادائیگی کی۔ نقد کاموں کی رقم بینک ٹرانسفر یا ایزی پیسہ کے ذریعے واپس کی جاتی ہے، عموماً فیصلے کے پانچ کاروباری دنوں کے اندر۔')}
            </p>
            <p>
              <strong>{t('This page is a placeholder and must be reviewed by a Pakistani legal adviser before launch.', 'یہ صفحہ ایک عارضی مسودہ ہے اور لانچ سے پہلے کسی پاکستانی قانونی مشیر سے اس کا جائزہ لازمی ہے۔')}</strong>
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
