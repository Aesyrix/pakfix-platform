'use client';

import { AppBottomNav } from '@/components/layout/AppBottomNav';
import { CUSTOMER_BOTTOM_NAV } from '@/lib/dashboard/nav';

/** The customer (and property-manager) mobile bottom bar. */
export function BottomNav() {
  return (
    <AppBottomNav items={CUSTOMER_BOTTOM_NAV} ariaLabel="Primary" ariaLabelUr="بنیادی" />
  );
}
