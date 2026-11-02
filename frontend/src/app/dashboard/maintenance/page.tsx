'use client';

import { CalendarDays } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function MaintenancePage() {
  return (
    <NotOnWebsiteYet
      title="Maintenance plans"
      titleUr="مرمت کے منصوبے"
      description="Maintenance plans are not available yet."
      descriptionUr="مرمت کے منصوبے ابھی دستیاب نہیں۔"
      icon={<CalendarDays className="h-5 w-5" />}
    />
  );
}
