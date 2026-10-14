'use client';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CUSTOMER_NAV } from '@/lib/dashboard/nav';

/** The customer (and property-manager) desktop navigation. */
export function DashboardSidebar() {
  return (
    <AppSidebar
      sections={CUSTOMER_NAV}
      brandHref="/dashboard"
      ariaLabel="Dashboard"
      ariaLabelUr="ڈیش بورڈ"
    />
  );
}
