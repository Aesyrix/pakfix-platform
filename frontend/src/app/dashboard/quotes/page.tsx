'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { SkeletonCard } from '@/components/ui/Skeleton';

/** The old "Quotes" address: requests and their offers now live under Requests. */
export default function QuotesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/requests');
  }, [router]);
  return (
    <Container className="py-6">
      <SkeletonCard />
    </Container>
  );
}
