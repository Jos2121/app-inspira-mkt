import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '@/lib/auth-client';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';

export function AppLayout() {
  const { data, isPending } = useAuthSession();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isPending) {
    return <div className="h-screen w-full flex items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div></div>;
  }

  if (!data?.user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  const role = data.user.role || 'ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';
  
  // Lógica de Protección Frontend (RBAC)
  const accessibleTabs = data.user.accessibleTabs || [];
  const isSuperadmin = role === 'SUPERADMIN' || accessibleTabs.includes('*');
  const currentPath = location.pathname;

  if (!isSuperadmin) {
    // Si intenta acceder a Staff/Partners y no es superadmin
    if (currentPath.startsWith('/partners')) {
      return <Navigate to={accessibleTabs[0] || '/'} replace />;
    }

    // Si intenta acceder a un tab al cual no tiene acceso
    const hasAccess = accessibleTabs.some(tab => currentPath === tab || (tab !== '/' && currentPath.startsWith(tab)));
    if (!hasAccess && accessibleTabs.length > 0) {
      return <Navigate to={accessibleTabs[0] || '/'} replace />;
    }
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-zinc-50 overflow-hidden">
      <MobileHeader 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      <Sidebar 
        isAdmin={isAdmin}
        role={role}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={data.user}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:py-4 md:pr-4 transition-all duration-300">
        <div className="h-full flex flex-col glass rounded-none md:rounded-3xl overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-4 md:p-10">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}