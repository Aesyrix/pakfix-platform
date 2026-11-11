import type { Metadata } from 'next';
import { AuthIntro } from '@/components/auth/AuthIntro';
import { AuthSwitch } from '@/components/auth/AuthSwitch';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardBody } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your PakFix account to manage bookings, properties and repairs.',
  // A sign-in page has no business in search results.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Card className="shadow-lifted">
      <CardBody className="sm:p-8">
        <AuthIntro
          title="Welcome back"
          titleUr="خوش آمدید"
          description="Sign in with the email or phone number on your account."
          descriptionUr="اپنے اکاؤنٹ کے ای میل یا فون نمبر سے سائن اِن کریں۔"
        />

        {/* The form reads `?next=` only when submitted, so it is part of the built page. */}
        <LoginForm className="mt-6" />

        <AuthSwitch
          prompt="New to PakFix?"
          promptUr="پاک فکس پر نئے ہیں؟"
          href="/register"
          linkLabel="Create an account"
          linkLabelUr="اکاؤنٹ بنائیں"
        />
      </CardBody>
    </Card>
  );
}
