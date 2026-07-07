import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '@/lib/auth-client';
import { useState } from 'react';
import { Sidebar, navItems } from './Sidebar';
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

  const role = data.user.role || 'Operador';
  const isAdmin = role === 'Admin';
  
  const currentNav = navItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)));

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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:py-4 md:pr-4 transition-all duration-300">
        <div className="h-full flex flex-col glass rounded-none md:rounded-3xl overflow-hidden relative">
          <header className="hidden md:flex h-20 items-center justify-between px-10 border-b border-zinc-100/50 sticky top-0 z-10 bg-white/50 backdrop-blur-md shrink-0">
            <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">
              {currentNav?.label || 'Vista General'}
            </h1>
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-100/50 px-3 py-1.5 rounded-full border border-zinc-200/50">
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                 SYS_ONLINE
               </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-10">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}