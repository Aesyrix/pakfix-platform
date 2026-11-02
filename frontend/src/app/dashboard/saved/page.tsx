'use client';

import { Star } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function SavedPage() {
  return (
    <NotOnWebsiteYet
      title="Saved"
      titleUr="محفوظ شدہ"
      description="Saving professionals is not available yet."
      descriptionUr="پروفیشنلز محفوظ کرنا ابھی دستیاب نہیں۔"
      icon={<Star className="h-5 w-5" />}
    />
  );
}
