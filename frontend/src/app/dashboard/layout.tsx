import { RequireAuth } from '@/components/auth/RequireAuth';
import { BottomNav } from '@/components/layout/BottomNav';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { ProModeBar } from '@/components/account/ModeBar';

/**
 * The customer application shell (also a professional's Customer mode).
 *
 * Sidebar on a laptop, bottom bar on a phone. `has-bottom-nav` reserves the
 * space the fixed bar occupies so the last row of content is never hidden
 * underneath it.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={['customer', 'property_manager', 'technician']}>
      <div className="flex min-h-dvh app-canvas">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* A professional here is in Customer mode. */}
          <ProModeBar />
          <main id="main" className="flex-1 has-bottom-nav lg:pb-0">
            {children}
          </main>
        </div>

        <BottomNav />
      </div>
    </RequireAuth>
  );
}
