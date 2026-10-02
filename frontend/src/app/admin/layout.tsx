import type { Metadata } from 'next';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: { absolute: 'PakFix Admin' },
  robots: { index: false, follow: false },
};

/**
 * The internal content-management area.
 *
 * The role check here keeps the wrong people out of the interface; Laravel
 * checks the permission behind every request these screens make, so a
 * bypassed guard in the browser gains nothing.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={['support_agent', 'admin', 'super_admin']}>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
