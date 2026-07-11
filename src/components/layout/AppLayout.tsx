import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession, authClient } from '@/lib/auth-client';
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

  const role = data.user.role || 'Guest';
  
  if (role === 'Guest') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 max-w-md text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Cuenta Pendiente</h2>
          <p className="text-zinc-500 mb-6">Tu cuenta está pendiente de aprobación. Por favor, contacta a un administrador para que te asigne un rol.</p>
          <button
            onClick={() => authClient.signOut()}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = role === 'Admin';

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