import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthIntro } from '@/components/auth/AuthIntro';
import { AuthSwitch } from '@/components/auth/AuthSwitch';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your PakFix account to manage bookings, properties and repairs.',
  // A sign-in page has no business in search results.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Card>
      <CardBody className="sm:p-8">
        <AuthIntro
          title="Welcome back"
          titleUr="خوش آمدید"
          description="Sign in with the email address or phone number on your account."
          descriptionUr="اپنے اکاؤنٹ کے ای میل پتے یا فون نمبر سے سائن ان کریں۔"
        />

        {/*
          The form reads `?next=` to resume an interrupted journey, which opts
          it out of prerendering. The boundary keeps the rest of the page
          static and shows the form's shape rather than a blank gap.
        */}
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm className="mt-6" />
        </Suspense>

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

function LoginFormSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
