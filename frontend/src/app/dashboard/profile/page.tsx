'use client';

import { PageHeader } from '@/components/dashboard/DashboardPage';
import { useT } from '@/components/i18n/LocaleProvider';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useAuthStore } from '@/stores/auth';

/** The signed-in customer's real details, read-only here. */
export default function ProfilePage() {
  const t = useT();
  const user = useAuthStore((state) => state.user);
  const rows: Array<[string, string | null | undefined]> = [
    [t('Name', 'نام'), user?.name],
    [t('Email', 'ای میل'), user?.email],
    [t('Phone', 'فون'), user?.phone],
    [t('City', 'شہر'), user?.city?.name],
  ];

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader title="Profile" titleUr="پروفائل" />
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
    </Container>
  );
}
