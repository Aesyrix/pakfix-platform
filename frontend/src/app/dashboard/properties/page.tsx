'use client';

import { Building2 } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function PropertiesPage() {
  return (
    <NotOnWebsiteYet
      title="Properties"
      titleUr="پراپرٹیز"
      description="Saving your properties is not available yet."
      descriptionUr="پراپرٹیز محفوظ کرنا ابھی دستیاب نہیں۔"
      icon={<Building2 className="h-5 w-5" />}
    />
  );
}
