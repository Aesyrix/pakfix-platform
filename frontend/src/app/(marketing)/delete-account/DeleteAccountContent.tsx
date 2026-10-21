'use client';

import { CheckCircle2, Smartphone, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/components/i18n/LocaleProvider';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { apiRequest, ApiError, setToken } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';

/**
 * Google Play requires a web page where people can delete their account
 * without the app. Signed-in visitors can do it here; everyone else sees how.
 */
export function DeleteAccountContent() {
  const t = useT();

  const erased = [
    [t('Your name, email address and phone number', 'آپ کا نام، ای میل اور فون نمبر')],
    [t('Your profile photo, saved addresses and properties', 'آپ کی پروفائل تصویر، محفوظ پتے اور پراپرٹیز')],
    [t('For professionals: your CNIC number, CNIC photos and selfie', 'پروفیشنلز کے لیے: شناختی کارڈ نمبر، شناختی کارڈ کی تصاویر اور سیلفی')],
    [t('Your open requests and offers (they are cancelled)', 'آپ کی کھلی درخواستیں اور آفرز (منسوخ ہو جاتی ہیں)')],
    [t('Every device you are signed in on', 'ہر وہ ڈیوائس جس پر آپ سائن ان ہیں')],
  ];

  return (
    <>
      <PageHeader
        title={t('Delete your account', 'اپنا اکاؤنٹ حذف کریں')}
        subtitle={t(
          'You can delete your PakFix account and personal data at any time, from the app or from this page.',
          'آپ کسی بھی وقت اپنا پاک فکس اکاؤنٹ اور ذاتی ڈیٹا ایپ سے یا اس صفحے سے حذف کر سکتے ہیں۔'
        )}
      />
      <Container className="grid gap-6 py-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Smartphone className="h-5 w-5 text-[#00824A]" aria-hidden="true" />
                {t('In the PakFix app', 'پاک فکس ایپ میں')}
              </h2>
              <p className="text-sm text-ink-600">
                {t(
                  'Open the app, go to Account, tap Delete account, and confirm with your password.',
                  'ایپ کھولیں، اکاؤنٹ میں جائیں، "اکاؤنٹ حذف کریں" پر ٹیپ کریں، اور اپنے پاس ورڈ سے تصدیق کریں۔'
                )}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{t('What is deleted straight away', 'فوراً کیا حذف ہوتا ہے')}</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {erased.map(([line]) => (
                  <li key={line} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00824A]" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
              <h2 className="mt-2 text-lg font-semibold">{t('What PakFix keeps', 'پاک فکس کیا رکھتا ہے')}</h2>
              <p className="text-sm text-ink-600">
                {t(
                  'Records of jobs that already happened (the booking, price, reviews and chat) stay, shown as "Deleted user", because the other person and our accounts rely on them and the law may require them. They no longer carry your name or contact details.',
                  'جو کام ہو چکے ہیں ان کا ریکارڈ (بکنگ، قیمت، ریویوز اور چیٹ) "حذف شدہ صارف" کے نام سے باقی رہتا ہے، کیونکہ دوسرا فریق اور ہمارا حساب کتاب ان پر انحصار کرتا ہے اور قانون بھی تقاضا کر سکتا ہے۔ ان میں آپ کا نام یا رابطہ نہیں رہتا۔'
                )}
              </p>
              <p className="text-sm text-ink-600">
                {t('You cannot delete your account while a job is in progress. Finish or cancel it first.', 'جب کوئی کام جاری ہو تو اکاؤنٹ حذف نہیں ہو سکتا۔ پہلے اسے مکمل یا منسوخ کریں۔')}{' '}
                {t('Questions?', 'سوالات؟')}{' '}
                <Link href="/contact" className="font-medium text-[#00824A] underline">
                  {t('Contact us', 'ہم سے رابطہ کریں')}
                </Link>
                .
              </p>
            </CardBody>
          </Card>
        </div>

        <DeletePanel />
      </Container>
    </>
  );
}

function DeletePanel() {
  const t = useT();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const initialising = useAuthStore((state) => state.initialising);
  const setUser = useAuthStore((state) => state.setUser);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);

  async function remove() {
    setBusy(true);
    setError(undefined);
    try {
      await apiRequest('account', { method: 'DELETE', body: { password, reason: reason.trim() || undefined } });
      setToken(null);
      setUser(null);
      setDone(true);
      toast.success(t('Your account has been deleted.', 'آپ کا اکاؤنٹ حذف ہو گیا ہے۔'));
    } catch (e) {
      setError(e instanceof ApiError ? (e.fieldError('password') ?? e.fieldError('account') ?? e.message) : t('Something went wrong. Please try again.', 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Trash2 className="h-5 w-5 text-[#DC2626]" aria-hidden="true" />
          {t('Delete it here', 'یہاں حذف کریں')}
        </h2>

        {done ? (
          <p className="text-sm">{t('Your account and personal details have been deleted. Thank you for using PakFix.', 'آپ کا اکاؤنٹ اور ذاتی تفصیلات حذف ہو گئی ہیں۔ پاک فکس استعمال کرنے کا شکریہ۔')}</p>
        ) : initialising ? null : !user ? (
          <>
            <p className="text-sm text-ink-600">
              {t('Sign in with the account you want to delete, then come back to this page.', 'جو اکاؤنٹ حذف کرنا ہے اس سے سائن ان کریں، پھر اس صفحے پر واپس آئیں۔')}
            </p>
            <ButtonLink href="/login?next=%2Fdelete-account">{t('Sign in', 'سائن ان کریں')}</ButtonLink>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-600">
              {t('Signed in as', 'سائن ان بطور')} <span className="font-semibold text-foreground">{user.email ?? user.name}</span>
            </p>
            <Input
              type="password"
              label={t('Your password', 'آپ کا پاس ورڈ')}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={error}
            />
            <Textarea
              label={t('Why are you leaving? (optional)', 'آپ کیوں جا رہے ہیں؟ (اختیاری)')}
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            {confirming ? (
              <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-[#FCA5A5] bg-[#FEE2E2] p-3">
                <p className="text-sm font-medium text-[#991B1B]">
                  {t('This cannot be undone. Delete your account now?', 'یہ واپس نہیں ہو سکتا۔ کیا ابھی اکاؤنٹ حذف کریں؟')}
                </p>
                <div className="flex gap-2">
                  <Button variant="danger" onClick={remove} loading={busy} disabled={!password}>
                    {t('Yes, delete my account', 'جی ہاں، میرا اکاؤنٹ حذف کریں')}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
                    {t('Cancel', 'منسوخ')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirming(true)} disabled={!password}>
                {t('Delete my account', 'میرا اکاؤنٹ حذف کریں')}
              </Button>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
