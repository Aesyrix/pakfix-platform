'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ProServicesEditor } from '@/components/account/ProServicesEditor';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { useT } from '@/components/i18n/LocaleProvider';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { accountApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/auth';

/** The professional's real profile. Services can be changed here, as in the app. */
export default function ProProfilePage() {
  const t = useT();
  const user = useAuthStore((state) => state.user);
  const query = useQuery({ queryKey: ['account-pro-profile'], queryFn: accountApi.proProfile, staleTime: 15_000 });
  const p = query.data;
  const [editing, setEditing] = useState(false);

  const rows: Array<[string, string | null | undefined]> = [
    [t('Name', 'نام'), user?.name],
    [t('Email', 'ای میل'), user?.email],
    [t('Phone', 'فون'), user?.phone],
    [t('Business name', 'کاروبار کا نام'), p?.business_name],
    [t('City', 'شہر'), p?.city?.name],
    [t('Experience', 'تجربہ'), p ? t(`${p.years_experience} years`, `${p.years_experience} سال`) : null],
    [t('Service radius', 'خدمت کا دائرہ'), p ? `${p.service_radius_km} km` : null],
  ];

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader title="Profile" titleUr="پروفائل" description="To change your other details, use the PakFix mobile app." descriptionUr="دوسری تفصیلات بدلنے کے لیے پاک فکس موبائل ایپ استعمال کریں۔" />
      {query.isPending ? (
        <SkeletonCard />
      ) : query.isError || !p ? (
        <ErrorState description={t('Your profile could not be loaded.', 'آپ کی پروفائل لوڈ نہیں ہو سکی۔')} onRetry={() => query.refetch()} />
      ) : (
        <div className="flex flex-col gap-4">
        <Card>
          <CardBody className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{t('Your services', 'آپ کی خدمات')}</h2>
              {editing ? null : (
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                  {t('Edit services', 'خدمات میں ترمیم')}
                </Button>
              )}
            </div>
            {editing ? (
              <ProServicesEditor profile={p} onDone={() => setEditing(false)} />
            ) : (
              <p className="text-sm font-medium">{p.categories.map((category) => category.name).join(', ') || '—'}</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-ink-500">{label}</dt>
                  <dd className="font-medium">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        </div>
      )}
    </Container>
  );
}
