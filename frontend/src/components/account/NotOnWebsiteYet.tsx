'use client';

import type { ReactNode } from 'react';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { useT } from '@/components/i18n/LocaleProvider';

/**
 * An account page whose feature is not on the website. It says so plainly:
 * these pages must never show invented figures to a real person.
 */
export function NotOnWebsiteYet({
  title,
  titleUr,
  description,
  descriptionUr,
  icon,
  action,
  heading,
  headingUr,
}: {
  title: string;
  titleUr: string;
  description: string;
  descriptionUr: string;
  icon: ReactNode;
  action?: ReactNode;
  heading?: string;
  headingUr?: string;
}) {
  const t = useT();

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader title={title} titleUr={titleUr} />
      <EmptyState
        className="mt-6"
        icon={icon}
        title={heading ? t(heading, headingUr) : t('Not on the website yet', 'ابھی ویب سائٹ پر دستیاب نہیں')}
        description={t(description, descriptionUr)}
        action={action}
      />
    </Container>
  );
}
