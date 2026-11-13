'use client';

import { useQuery } from '@tanstack/react-query';
import { HandCoins } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { OfferStatusBadge } from '@/components/jobs/JobParts';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { proApi, type Offer } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';

/** Every offer the professional has sent (the app's Offers tab). */
export default function ProOffersPage() {
  const t = useAppText();
  const offers = useQuery({ queryKey: ['pro-offers'], queryFn: proApi.offers, refetchInterval: 30_000 });

  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <h1 className="mb-5 font-display text-2xl font-bold">{t('myOffersTitle')}</h1>
      {offers.isPending ? (
        <SkeletonCard />
      ) : offers.isError ? (
        <ErrorState description={t('errorGeneric')} onRetry={() => offers.refetch()} />
      ) : offers.data.length === 0 ? (
        <EmptyState icon={<HandCoins className="h-5 w-5" />} title={t('myOffersEmpty')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {offers.data.map((offer) => (
            <li key={offer.id}>
              <OfferRow offer={offer} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

function OfferRow({ offer }: { offer: Offer }) {
  const r = offer.request;
  const place = [r?.area?.name, r?.city?.name].filter(Boolean).join(', ');
  // An accepted offer opens its job; a waiting one opens the request; the rest are history.
  const href =
    offer.status === 'accepted' && offer.booking_id
      ? `/pro/bookings/view?id=${offer.booking_id}`
      : offer.status === 'sent' && r
        ? `/pro/jobs/view?id=${r.id}`
        : null;

  const body: ReactNode = (
    <Card interactive={href !== null}>
      <CardBody className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
          <CategoryIcon name={r?.category?.icon ?? null} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{r?.category?.name ?? offer.reference}</p>
          <p className="truncate text-sm text-ink-500">
            {[place, offer.total.display].filter(Boolean).join(' · ')}
          </p>
        </div>
        <OfferStatusBadge offer={offer} />
      </CardBody>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
