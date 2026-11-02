'use client';

import { Wallet } from 'lucide-react';
import { NotOnWebsiteYet } from '@/components/account/NotOnWebsiteYet';

export default function PaymentsPage() {
  return (
    <NotOnWebsiteYet
      title="Payments"
      titleUr="ادائیگیاں"
      description="Jobs are paid in cash to the professional. Online payments and invoices are not available yet."
      descriptionUr="کام کی ادائیگی پروفیشنل کو نقد کی جاتی ہے۔ آن لائن ادائیگی اور رسیدیں ابھی دستیاب نہیں۔"
      icon={<Wallet className="h-5 w-5" />}
    />
  );
}
