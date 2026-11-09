'use client';

import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { useT } from '@/components/i18n/LocaleProvider';
import type { MarketplaceBooking, MarketplaceRequest } from '@/lib/api/types';

/** A real booking, as returned by the API. */
export function BookingCard({ booking }: { booking: MarketplaceBooking }) {
  const t = useT();
  const tone = booking.status === 'cancelled' ? 'neutral' : booking.is_active ? 'info' : 'safe';

  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{booking.category?.name ?? t('Job', 'کام')}</h3>
            <p className="text-xs text-ink-500">{booking.reference}</p>
          </div>
          <Badge tone={tone}>{booking.status_label}</Badge>
        </div>
        <p className="text-sm text-ink-600">{booking.problem_description}</p>
        <p className="text-sm text-ink-600">{[booking.address_line, booking.city?.name].filter(Boolean).join(', ')}</p>
        {booking.total.minor > 0 ? <p className="text-sm font-bold text-brand-600">{booking.total.display}</p> : null}
      </CardBody>
    </Card>
  );
}

/** A real request, for its customer or for a professional nearby. */
export function RequestCard({ request }: { request: MarketplaceRequest }) {
  const t = useT();
  const place = [request.area?.name, request.city?.name].filter(Boolean).join(', ');

  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{request.category?.name ?? t('Request', 'درخواست')}</h3>
            <p className="text-xs text-ink-500">{request.reference}</p>
          </div>
          <Badge tone="info">{request.quotes_count === 1 ? t('1 offer', '1 آفر') : t(`${request.quotes_count} offers`, `${request.quotes_count} آفرز`)}</Badge>
        </div>
        <p className="text-sm text-ink-600">{request.description}</p>
        <p className="text-sm text-ink-600">
          {place}
          {request.distance_km != null ? ` · ${request.distance_km} km` : ''}
        </p>
        {request.customer_offer ? (
          <p className="text-sm font-bold text-brand-600">
            {t('Customer offer', 'کسٹمر کی آفر')}: {request.customer_offer.display}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}
