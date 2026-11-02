'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { useT } from '@/components/i18n/LocaleProvider';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { RequestCard } from '@/components/account/AccountLists';
import { accountApi } from '@/lib/api/endpoints';

/** The customer's real requests and how many offers each has. */
export default function QuotesPage() {
  const t = useT();
  const query = useQuery({ queryKey: ['account-requests'], queryFn: accountApi.requests, staleTime: 15_000 });

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader title="Requests and offers" titleUr="درخواستیں اور آفرز" />
      {query.isPending ? (
        <SkeletonCard />
      ) : query.isError || !query.data ? (
        <ErrorState description={t('Your requests could not be loaded.', 'آپ کی درخواستیں لوڈ نہیں ہو سکیں۔')} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title={t('No requests yet', 'ابھی کوئی درخواست نہیں')}
          description={t('Requests you post in the PakFix mobile app appear here.', 'پاک فکس موبائل ایپ میں کی گئی درخواستیں یہاں نظر آئیں گی۔')}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.data.map((request) => (
            <li key={request.id}>
              <RequestCard request={request} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
