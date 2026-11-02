'use client';

import { Star } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function ProReviewsPage() {
  return (
    <NotOnWebsiteYet
      title="Reviews"
      titleUr="ریویوز"
      description="Reviews from your customers and your replies. It will be available in the PakFix mobile app."
      descriptionUr="آپ کے کسٹمرز کے ریویوز اور آپ کے جوابات۔ یہ پاک فکس موبائل ایپ میں دستیاب ہو گا۔"
      icon={<Star className="h-5 w-5" />}
    />
  );
}
