'use client';

import { Bell } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function NotificationsPage() {
  return (
    <NotOnWebsiteYet
      title="Notifications"
      titleUr="اطلاعات"
      description="Job updates and new offers are sent as notifications by the PakFix mobile app."
      descriptionUr="کام کی اپ ڈیٹس اور نئی آفرز کی اطلاعات پاک فکس موبائل ایپ بھیجتی ہے۔"
      icon={<Bell className="h-5 w-5" />}
    />
  );
}
