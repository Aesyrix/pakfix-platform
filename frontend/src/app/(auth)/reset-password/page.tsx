import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Set a new password',
  description: 'Choose a new password for your PakFix account.',
  path: '/reset-password',
  noindex: true,
});

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardBody className="sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>

        {/* The form reads the token from the link, so it renders in the browser. */}
        <Suspense
          fallback={
            <div className="mt-6 flex flex-col gap-4" aria-hidden="true">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </CardBody>
    </Card>
  );
}
