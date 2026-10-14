import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppBottomNav } from '@/components/layout/AppBottomNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { PRO_BOTTOM_NAV, PRO_NAV } from '@/lib/dashboard/nav';

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
        <AppSidebar sections={PRO_NAV} brandHref="/pro" ariaLabel="Professional dashboard" ariaLabelUr="پروفیشنل ڈیش بورڈ" />

        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main" className="flex-1 has-bottom-nav lg:pb-0">
            {children}
          </main>
        </div>

        <AppBottomNav items={PRO_BOTTOM_NAV} ariaLabel="Professional" ariaLabelUr="پروفیشنل" />
      </div>
    </RequireAuth>
  );
}
