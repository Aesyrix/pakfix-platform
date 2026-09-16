import Link from 'next/link';
import { PakFixLogo } from '@/components/layout/PakFixLogo';

/**
 * A deliberately quiet shell for sign-in and sign-up: no navigation, no
 * marketing, nothing competing with the form. The only way out is back to
 * the homepage.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-brand-wash to-background">
      <header className="flex items-center justify-center py-8">
        <Link href="/" aria-label="PakFix home">
          <PakFixLogo className="h-9" />
        </Link>
      </header>

      <main id="main" className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
