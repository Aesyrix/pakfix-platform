'use client';

import { MessageSquare } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function ProMessagesPage() {
  return (
    <NotOnWebsiteYet
      title="Messages"
      titleUr="پیغامات"
      description="Chat with customers about your jobs. It will be available in the PakFix mobile app."
      descriptionUr="اپنے کاموں کے بارے میں کسٹمرز سے چیٹ۔ یہ پاک فکس موبائل ایپ میں دستیاب ہو گا۔"
      icon={<MessageSquare className="h-5 w-5" />}
    />
  );
}
