'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { useT } from '@/components/i18n/LocaleProvider';
import type { MarketplaceBooking } from '@/lib/api/types';
import { bookingStatusName } from '@/lib/marketplace-status';

/** A real booking, as returned by the API; opens the booking's page. */
export function BookingCard({ booking }: { booking: MarketplaceBooking }) {
  const t = useT();
  // Same words and colours as the app.
  const status = bookingStatusName(booking.status);

  return (
    <Link href={`/dashboard/bookings/view?id=${booking.id}`} className="block">
    <Card interactive>
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
    </Link>
  );
}
