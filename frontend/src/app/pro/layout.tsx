import { RequireAuth } from '@/components/auth/RequireAuth';
import { ProBottomNav } from '@/components/layout/ProBottomNav';
import { ProSidebar } from '@/components/layout/ProSidebar';

/**
 * The professional application shell for technicians and service companies.
 *
 * Sidebar on a laptop, bottom bar on a phone. `has-bottom-nav` reserves the
 * space the fixed bar occupies so the last row of content is never hidden
 * underneath it.
 */
export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={['technician', 'company']}>
      <div className="flex min-h-dvh">
        <ProSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main" className="flex-1 has-bottom-nav lg:pb-0">
            {children}
          </main>
        </div>

        <ProBottomNav />
      </div>
    </RequireAuth>
  );
}
