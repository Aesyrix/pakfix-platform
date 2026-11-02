'use client';

import { Settings } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';
import { ButtonLink } from '@/components/ui/Button';
import { useT } from '@/components/i18n/LocaleProvider';

/** Settings live in the app; deleting an account also works on the website. */
export default function SettingsPage() {
  const t = useT();

  return (
    <NotOnWebsiteYet
      title="Settings"
      titleUr="ترتیبات"
      description="Language, appearance and blocked people are managed in the PakFix mobile app. You can delete your account here."
      descriptionUr="زبان، ظاہری شکل اور بلاک کیے گئے لوگ پاک فکس موبائل ایپ میں منظم ہوتے ہیں۔ اکاؤنٹ آپ یہاں حذف کر سکتے ہیں۔"
      icon={<Settings className="h-5 w-5" />}
      action={<ButtonLink href="/delete-account" variant="secondary">{t('Delete account', 'اکاؤنٹ حذف کریں')}</ButtonLink>}
    />
  );
}
