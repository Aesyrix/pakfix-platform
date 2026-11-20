'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import { proApi } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';

/**
 * Opens a professional's new job by itself when a customer accepts their
 * offer while they have the website open, wherever they are in the pro
 * pages (the app's AcceptedOfferWatcher). Checks every 20 seconds; offers
 * already accepted when the page opened are never re-opened.
 */
export function AcceptedOfferWatcher() {
  const t = useAppText();
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const known = useRef<Set<string> | null>(null);

  const offers = useQuery({
    queryKey: ['pro-offers-watch'],
    queryFn: proApi.offers,
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
    retry: false,
  });

  useEffect(() => {
    if (!offers.data) return;
    const accepted = new Set(offers.data.filter((o) => o.status === 'accepted' && o.booking_id).map((o) => o.booking_id as string));
    const before = known.current;
    known.current = accepted;
    if (before === null) return; // First look: only remember what is already accepted.

    const fresh = [...accepted].find((id) => !before.has(id));
    if (!fresh) return;
    void queryClient.invalidateQueries({ queryKey: ['pro-offers'] });
    void queryClient.invalidateQueries({ queryKey: ['pro-bookings'] });
    toast.success(t('offerAcceptedOpened'));
    router.push(`/pro/bookings/view?id=${fresh}`);
  }, [offers.data, queryClient, router, t, toast]);

  return null;
}
