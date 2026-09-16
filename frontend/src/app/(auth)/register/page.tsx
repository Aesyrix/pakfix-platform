import type { Metadata } from 'next';
import Link from 'next/link';
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
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-ink-600">
          One account for repairs, maintenance and your property history.
        </p>

        <RegisterForm cities={cities} className="mt-6" />

        <p className="mt-6 text-center text-sm text-ink-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
