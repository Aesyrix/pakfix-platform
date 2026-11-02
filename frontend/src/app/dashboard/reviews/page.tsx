'use client';

import { Star } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function ReviewsPage() {
  return (
    <NotOnWebsiteYet
      title="Reviews"
      titleUr="ریویوز"
      description="Rate a job after it is finished. It will be available in the PakFix mobile app."
      descriptionUr="کام مکمل ہونے کے بعد ریٹنگ دیں۔ یہ پاک فکس موبائل ایپ میں دستیاب ہو گا۔"
      icon={<Star className="h-5 w-5" />}
    />
  );
}
