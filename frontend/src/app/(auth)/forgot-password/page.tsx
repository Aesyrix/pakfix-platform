import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Reset your password',
  description: 'Request a password reset link for your PakFix account.',
  path: '/forgot-password',
  noindex: true,
});

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardBody className="sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="mt-2 text-sm text-ink-600">
          Enter the email address on your account and we will send you a link to set a new password.
        </p>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-ink-600">
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-[#16A34A] hover:text-[#15803D]">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
