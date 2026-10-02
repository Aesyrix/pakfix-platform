import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { VerifyEmailResult } from '@/components/auth/VerifyEmailResult';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Verify your email',
  description: 'Confirm your email address for your PakFix account.',
  path: '/verify-email',
  noindex: true,
});

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardBody className="sm:p-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-3" aria-hidden="true">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
          }
        >
          <VerifyEmailResult />
        </Suspense>
      </CardBody>
    </Card>
  );
}
