'use client';

import { MessageSquare } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function MessagesPage() {
  return (
    <NotOnWebsiteYet
      title="Messages"
      titleUr="پیغامات"
      description="Chat with your professional about a job. It will be available in the PakFix mobile app."
      descriptionUr="کام کے بارے میں اپنے پروفیشنل سے چیٹ۔ یہ پاک فکس موبائل ایپ میں دستیاب ہو گا۔"
      icon={<MessageSquare className="h-5 w-5" />}
    />
  );
}
