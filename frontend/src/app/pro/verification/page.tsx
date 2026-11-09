'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { useT } from '@/components/i18n/LocaleProvider';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { accountApi } from '@/lib/api/endpoints';

const STATUS: Record<string, [string, string, 'safe' | 'warn' | 'danger' | 'neutral']> = {
  verified: ['Verified', 'تصدیق شدہ', 'safe'],
  pending: ['Awaiting review', 'جائزے کا منتظر', 'warn'],
  rejected: ['Sent back', 'واپس بھیجا گیا', 'danger'],
  more_info_requested: ['More information needed', 'مزید معلومات درکار', 'danger'],
  suspended: ['Suspended', 'معطل', 'danger'],
  not_submitted: ['Not submitted', 'جمع نہیں کرایا', 'neutral'],
};

/** The professional's real verification status. Documents are submitted in the app. */
export default function ProVerificationPage() {
  const t = useT();
  const query = useQuery({ queryKey: ['account-pro-profile'], queryFn: accountApi.proProfile, staleTime: 15_000 });
  const verification = query.data?.verification;
  const [label, labelUr, tone] = STATUS[verification?.status ?? 'not_submitted'] ?? ['Unknown', 'نامعلوم', 'neutral'];

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader title="Verification" titleUr="تصدیق" />
      {query.isPending ? (
        <SkeletonCard />
      ) : query.isError || !query.data ? (
        <ErrorState description={t('Your verification could not be loaded.', 'آپ کی تصدیق لوڈ نہیں ہو سکی۔')} onRetry={() => query.refetch()} />
      ) : (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <div>
              <Badge tone={tone}>{t(label, labelUr)}</Badge>
            </div>
            {verification?.rejection_reason ? <p className="text-sm text-danger-700">{verification.rejection_reason}</p> : null}
            {verification?.status !== 'verified' ? (
              <p className="text-sm text-ink-600">
                {t('Your profile, CNIC photos and selfie are submitted in the PakFix mobile app.', 'آپ کی پروفائل، شناختی کارڈ کی تصاویر اور سیلفی پاک فکس موبائل ایپ میں جمع کرائی جاتی ہیں۔')}
              </p>
            ) : null}
          </CardBody>
        </Card>
      )}
    </Container>
  );
}
