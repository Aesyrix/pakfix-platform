import type { Metadata } from 'next';
import { AuthIntro } from '@/components/auth/AuthIntro';
import { AuthSwitch } from '@/components/auth/AuthSwitch';
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
        <AuthIntro
          title="Forgot your password?"
          titleUr="پاس ورڈ بھول گئے؟"
          description="Enter the email address on your account and we will send you a link to set a new password."
          descriptionUr="اپنے اکاؤنٹ کا ای میل پتہ درج کریں اور ہم نیا پاس ورڈ مقرر کرنے کا لنک بھیج دیں گے۔"
        />

        <ForgotPasswordForm />

        <AuthSwitch
          prompt="Remembered it?"
          promptUr="یاد آ گیا؟"
          href="/login"
          linkLabel="Sign in"
          linkLabelUr="سائن اِن"
        />
      </CardBody>
    </Card>
  );
}
