'use client';

import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { useT } from '@/components/i18n/LocaleProvider';
import type { MarketplaceBooking, MarketplaceRequest } from '@/lib/api/types';
import { bookingStatusName, requestStateName } from '@/lib/marketplace-status';

/** A real booking, as returned by the API. */
export function BookingCard({ booking }: { booking: MarketplaceBooking }) {
  const t = useT();
  // Same words and colours as the app.
  const status = bookingStatusName(booking.status);

  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{booking.category?.name ?? t('Job', 'کام')}</h3>
            <p className="text-xs text-ink-500">{booking.reference}</p>
          </div>
          <Badge tone={status.tone}>{t(status.en, status.ur)}</Badge>
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
  const state = requestStateName(request.state);
  // Offer counts only matter while the customer can still choose.
  const live = request.state === 'accepting_bids' || request.state === 'choosing';

  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{request.category?.name ?? t('Request', 'درخواست')}</h3>
            <p className="text-xs text-ink-500">{request.reference}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={state.tone}>{t(state.en, state.ur)}</Badge>
            {live ? (
              <Badge tone="neutral">
                {request.quotes_count === 1 ? t('1 offer', '1 آفر') : t(`${request.quotes_count} offers`, `${request.quotes_count} آفرز`)}
              </Badge>
            ) : null}
          </div>
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
