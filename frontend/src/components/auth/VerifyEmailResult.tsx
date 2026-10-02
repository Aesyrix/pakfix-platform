'use client';

import { CircleAlert, CircleCheck, MailQuestion } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
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
  const status = useSearchParams().get('status');
  const user = useAuthStore((state) => state.user);
  const toast = useToast();
  const [resending, setResending] = useState(false);

  async function resend() {
    setResending(true);

    try {
      const message = await authApi.resendVerification();
      toast.success(message || 'Verification email sent.');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not send the email. Try again shortly.');
    } finally {
      setResending(false);
    }
  }

  if (status === 'verified' || status === 'already-verified') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CircleCheck className="h-10 w-10 text-[#00824A]" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight">
          {status === 'verified' ? 'Email verified' : 'Already verified'}
        </h1>
        <p className="text-sm text-ink-600">
          {status === 'verified'
            ? 'Thanks. Your email address is confirmed, so we can send you booking updates.'
            : 'This email address was already confirmed. Nothing more to do.'}
        </p>
        <ButtonLink href={user?.home_path ?? '/dashboard'} size="lg" className="mt-2">
          Go to my dashboard
        </ButtonLink>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CircleAlert className="h-10 w-10 text-danger-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight">That link did not work</h1>
        <p className="text-sm text-ink-600">
          Verification links expire after 60 minutes, and only work for the address they were sent to. Sign in and we
          will send a fresh one.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {user ? (
            <Button onClick={resend} loading={resending} size="lg">
              Send a new link
            </Button>
          ) : (
            <ButtonLink href="/login" size="lg">
              Sign in
            </ButtonLink>
          )}
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Contact support
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <MailQuestion className="h-10 w-10 text-[#2563EB]" aria-hidden="true" />
      <h1 className="text-2xl font-bold tracking-tight">Confirm your email address</h1>
      <p className="text-sm text-ink-600">
        We sent a link to your email address. Open it to confirm, so PakFix can send you booking updates.
      </p>
      {user ? (
        <Button onClick={resend} loading={resending} variant="secondary" className="mt-2">
          Send it again
        </Button>
      ) : (
        <ButtonLink href="/login" className="mt-2">
          Sign in
        </ButtonLink>
      )}
    </div>
  );
}
