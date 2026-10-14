'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useT } from '@/components/i18n/LocaleProvider';
import { useAuthStore } from '@/stores/auth';
import type { UserRole } from '@/lib/api/types';

/**
 * Keeps signed-out visitors out of the app shell.
 *
 * This is a convenience, not a security boundary: it stops a stranger seeing
 * a half-rendered dashboard. Every piece of data behind it is authorised
 * again by Laravel, so bypassing this guard in the browser gains nothing.
 */
export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode;
  /** When given, the user must hold one of these roles. */
  roles?: UserRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const initialising = useAuthStore((state) => state.initialising);

  const allowed = !roles || (user ? roles.some((role) => user.roles.includes(role)) : false);

  useEffect(() => {
    if (initialising) return;

    if (!user) {
      // Remember where they were going, so sign-in can finish the journey.
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowed) {
      router.replace(user.home_path ?? '/dashboard');
    }
  }, [initialising, user, allowed, router, pathname]);

  if (initialising || !user || !allowed) {
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
}

/** Shown while the session is being restored, so nothing flashes. */
function DashboardSkeleton() {
  const t = useT();
  return (
    <Container className="py-8">
      <span className="sr-only" role="status">
        {t('Loading your dashboard', 'آپ کا ڈیش بورڈ لوڈ ہو رہا ہے')}
      </span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </Container>
  );
}
