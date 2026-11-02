'use client';

import { Wallet } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function ProEarningsPage() {
  return (
    <NotOnWebsiteYet
      title="Earnings"
      titleUr="کمائی"
      description="Your earnings will appear here once real payouts are running."
      descriptionUr="اصل ادائیگیاں شروع ہونے پر آپ کی کمائی یہاں نظر آئے گی۔"
      icon={<Wallet className="h-5 w-5" />}
    />
  );
}
