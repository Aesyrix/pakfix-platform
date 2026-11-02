'use client';

import { CalendarDays } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function ProSchedulePage() {
  return (
    <NotOnWebsiteYet
      title="Schedule"
      titleUr="شیڈول"
      description="Your booked jobs are listed under Jobs. A calendar view is not available yet."
      descriptionUr="آپ کے بک شدہ کام &quot;کام&quot; میں موجود ہیں۔ کیلنڈر ابھی دستیاب نہیں۔"
      icon={<CalendarDays className="h-5 w-5" />}
    />
  );
}
