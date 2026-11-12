'use client';

import { FileWarning, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { LEGAL_DRAFT } from '@/components/marketing/legal/LegalPage';
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
 *
 * Text: "PakFix Legal Pages" draft, 13 November 2026, section 5. Awaiting
 * legal approval, so it is English only for now (like the other legal pages).
 */
export function DeleteAccountContent() {
  const t = useT();
  const { locale } = useLocale();

  return (
    <>
      <PageHeader
        title={t('Delete your PakFix account', 'اپنا پاک فکس اکاؤنٹ حذف کریں')}
        subtitle={t('You can delete your PakFix account at any time.', 'آپ کسی بھی وقت اپنا پاک فکس اکاؤنٹ حذف کر سکتے ہیں۔')}
      />
      <Container className="grid gap-6 py-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {LEGAL_DRAFT ? (
            <div role="note" dir="ltr" lang="en" className="flex items-start gap-3 rounded-2xl border border-warn-200 bg-warn-50 p-4 text-sm text-warn-800">
              <FileWarning className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>
                <strong>Draft for legal review.</strong> This text has not yet been approved by a lawyer.
              </p>
            </div>
          ) : null}
          {locale === 'ur' ? (
            <p className="rounded-2xl border border-line bg-surface-muted p-4 text-sm text-ink-600">
              یہ صفحہ فی الحال صرف انگریزی میں دستیاب ہے۔ اردو ترجمہ قانونی منظوری کے بعد شامل کیا جائے گا۔
            </p>
          ) : null}

          <Card>
            <CardBody dir="ltr" lang="en" className="rich-text max-w-none">
              <ul>
                <li>
                  <strong>In the app:</strong> open Account, then Delete account. Enter your password and confirm.
                </li>
                <li>
                  <strong>On the website:</strong> sign in at pakfix.pk, open Settings, then Delete account.
                </li>
                <li>
                  <strong>Cannot sign in?</strong> Email <a href="mailto:support@pakfix.pk">support@pakfix.pk</a> from the email address on
                  your account, with the subject &ldquo;Delete my account&rdquo;. We will confirm it is you and delete the account within 7
                  days.
                </li>
              </ul>
              <p>You cannot delete your account while a job is in progress. Finish or cancel it first.</p>
              <p>
                <strong>Deleted straight away:</strong> your name, email, phone number, profile photo, saved addresses, all signed-in
                devices and, for professionals, your CNIC number, CNIC photos and selfie.
              </p>
              <p>
                <strong>Kept without your name:</strong> records of jobs that already happened (booking, price, reviews and chat) stay,
                shown as &ldquo;Deleted user&rdquo;, because the other person and our records rely on them.
              </p>
              <p>Deletion cannot be undone. To use PakFix again you will need a new account.</p>
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
          <Trash2 className="h-5 w-5 text-danger-500" aria-hidden="true" />
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
              <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-danger-200 bg-danger-100 p-3">
                <p className="text-sm font-medium text-danger-700">
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
