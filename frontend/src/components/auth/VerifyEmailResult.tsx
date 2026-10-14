'use client';

import { CircleAlert, CircleCheck, MailQuestion } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/components/i18n/LocaleProvider';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/auth';

/**
 * Where the link in the verification email lands.
 *
 * Laravel verifies the signed link itself and redirects here with the
 * outcome, so this page only has to explain what happened.
 */
export function VerifyEmailResult() {
  const t = useT();
  const status = useSearchParams().get('status');
  const user = useAuthStore((state) => state.user);
  const toast = useToast();
  const [resending, setResending] = useState(false);

  async function resend() {
    setResending(true);

    try {
      const message = await authApi.resendVerification();
      toast.success(message || t('Verification email sent.', 'تصدیقی ای میل بھیج دی گئی۔'));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t('Could not send the email. Try again shortly.', 'ای میل نہیں بھیجی جا سکی۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔'));
    } finally {
      setResending(false);
    }
  }

  if (status === 'verified' || status === 'already-verified') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CircleCheck className="h-10 w-10 text-[#00824A]" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight">
          {status === 'verified' ? t('Email verified', 'ای میل تصدیق شدہ') : t('Already verified', 'پہلے ہی تصدیق شدہ')}
        </h1>
        <p className="text-sm text-ink-600">
          {status === 'verified'
            ? t('Thanks. Your email address is confirmed, so we can send you booking updates.', 'شکریہ۔ آپ کا ای میل پتہ تصدیق شدہ ہے، تاکہ ہم آپ کو بکنگ کی اطلاعات بھیج سکیں۔')
            : t('This email address was already confirmed. Nothing more to do.', 'اس ای میل پتے کی پہلے ہی تصدیق ہو چکی ہے۔ مزید کچھ کرنے کی ضرورت نہیں۔')}
        </p>
        <ButtonLink href={user?.home_path ?? '/dashboard'} size="lg" className="mt-2">
          {t('Go to my dashboard', 'میرے ڈیش بورڈ پر جائیں')}
        </ButtonLink>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CircleAlert className="h-10 w-10 text-danger-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight">{t('That link did not work', 'وہ لنک کام نہیں کر سکا')}</h1>
        <p className="text-sm text-ink-600">
          {t('Verification links expire after 60 minutes, and only work for the address they were sent to. Sign in and we will send a fresh one.', 'تصدیقی لنک 60 منٹ بعد ختم ہو جاتے ہیں، اور صرف اسی پتے کے لیے کام کرتے ہیں جس پر بھیجے گئے تھے۔ سائن ان کریں اور ہم نیا بھیج دیں گے۔')}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {user ? (
            <Button onClick={resend} loading={resending} size="lg">
              {t('Send a new link', 'نیا لنک بھیجیں')}
            </Button>
          ) : (
            <ButtonLink href="/login" size="lg">
              {t('Sign in', 'سائن ان')}
            </ButtonLink>
          )}
          <ButtonLink href="/contact" variant="secondary" size="lg">
            {t('Contact support', 'سپورٹ سے رابطہ')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <MailQuestion className="h-10 w-10 text-[#2563EB]" aria-hidden="true" />
      <h1 className="text-2xl font-bold tracking-tight">{t('Confirm your email address', 'اپنے ای میل پتے کی تصدیق کریں')}</h1>
      <p className="text-sm text-ink-600">
        {t('We sent a link to your email address. Open it to confirm, so PakFix can send you booking updates.', 'ہم نے آپ کے ای میل پتے پر ایک لنک بھیجا ہے۔ تصدیق کے لیے اسے کھولیں، تاکہ پاک فکس آپ کو بکنگ کی اطلاعات بھیج سکے۔')}
      </p>
      {user ? (
        <Button onClick={resend} loading={resending} variant="secondary" className="mt-2">
          {t('Send it again', 'دوبارہ بھیجیں')}
        </Button>
      ) : (
        <ButtonLink href="/login" className="mt-2">
          {t('Sign in', 'سائن ان')}
        </ButtonLink>
      )}
    </div>
  );
}
