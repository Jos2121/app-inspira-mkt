import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthSession } from '@/lib/auth-client';
import { UserMenu } from '../UserMenu';
import { LayoutDashboard, Users, Package, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { data, isPending } = useAuthSession();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isPending) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div></div>;
  }

  if (!data?.user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  const role = data.user.role || 'Operador';
  const isAdmin = role === 'Admin';

  const navItems = [
    ...(isAdmin ? [{ icon: LayoutDashboard, label: 'Dashboard', path: '/' }] : []),
    { icon: ShoppingCart, label: 'Órdenes', path: '/orders' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Package, label: 'Productos', path: '/products' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-20">
        <div className="font-bold text-lg text-slate-900">Gestión MVP</div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-10 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex flex-col items-center border-b">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-3">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-lg text-slate-900">Gestión MVP</h2>
          <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full mt-2">
            {role}
          </span>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white border-b sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-800">
            {navItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 'Gestión MVP'}
          </h1>
          <UserMenu />
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
