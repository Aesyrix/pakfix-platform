import type { Metadata } from 'next';
import { AuthIntro } from '@/components/auth/AuthIntro';
import { AuthSwitch } from '@/components/auth/AuthSwitch';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardBody } from '@/components/ui/Card';
import { locationApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';

export const metadata: Metadata = {
  title: 'Create your account',
  description:
    'Create a PakFix account to diagnose home problems, book verified professionals and keep a maintenance record of your property.',
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  // Served cities only: signing up against a city PakFix has not launched in
  // would promise professionals that do not exist there yet.
  const cities = await safeFetch(() => locationApi.cities(true), [], 'served cities');

  return (
    <Card>
      <CardBody className="sm:p-8">
        <AuthIntro
          title="Create your account"
          titleUr="اپنا اکاؤنٹ بنائیں"
          description="One account for repairs, maintenance and your property history."
          descriptionUr="مرمت، دیکھ بھال اور آپ کی پراپرٹی کی تاریخ کے لیے ایک اکاؤنٹ۔"
        />

        <RegisterForm cities={cities} className="mt-6" />

        <AuthSwitch
          prompt="Already have an account?"
          promptUr="پہلے سے اکاؤنٹ ہے؟"
          href="/login"
          linkLabel="Sign in"
          linkLabelUr="سائن اِن"
        />
      </CardBody>
    </Card>
  );
}
