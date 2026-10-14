'use client';

import { AppBottomNav } from '@/components/layout/AppBottomNav';
import { PRO_BOTTOM_NAV } from '@/lib/dashboard/nav';

/** The professional (technician / company) mobile bottom bar. */
export function ProBottomNav() {
  return <AppBottomNav items={PRO_BOTTOM_NAV} ariaLabel="Professional" ariaLabelUr="پروفیشنل" />;
}
