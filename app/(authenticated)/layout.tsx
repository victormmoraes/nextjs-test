'use client';

import { useRouter } from 'next/navigation';
import { SidenavProvider, useSidenav } from '@/contexts/SidenavContext';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/ui/templates/Header';
import { Sidenav } from '@/components/ui/templates/Sidenav';
import { cn } from '@/lib/utils';

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isCollapsed } = useSidenav();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidenav isVibraTenant={user?.tenantId === 3} />
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[265px]'
        )}
      >
        <Header
          userName={user?.name || ''}
          tenantName={user?.tenantId?.toString() || ''}
          onLogout={handleLogout}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidenavProvider>
      <AuthenticatedContent>{children}</AuthenticatedContent>
    </SidenavProvider>
  );
}
