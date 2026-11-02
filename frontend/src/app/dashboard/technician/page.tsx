'use client';

import { Briefcase } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';
import { ButtonLink } from '@/components/ui/Button';
import { useT } from '@/components/i18n/LocaleProvider';

/** This old sample page moved; it points to the real one. */
export default function DashboardTechnicianPage() {
  const t = useT();

  return (
    <NotOnWebsiteYet
      title="Professional portal"
      titleUr="پروفیشنل پورٹل"
      heading="This page has moved"
      headingUr="یہ صفحہ منتقل ہو گیا ہے"
      description="Use the button below to open it."
      descriptionUr="کھولنے کے لیے نیچے دیا گیا بٹن استعمال کریں۔"
      icon={<Briefcase className="h-5 w-5" />}
      action={<ButtonLink href="/pro">{t('Open', 'کھولیں')}</ButtonLink>}
    />
  );
}
