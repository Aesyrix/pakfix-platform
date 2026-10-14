'use client';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { PRO_NAV } from '@/lib/dashboard/nav';

/** The professional (technician / company) desktop navigation. */
export function ProSidebar() {
  return (
    <AppSidebar
      sections={PRO_NAV}
      brandHref="/pro"
      ariaLabel="Professional dashboard"
      ariaLabelUr="پروفیشنل ڈیش بورڈ"
    />
  );
}
