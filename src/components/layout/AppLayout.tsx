import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthSession } from '@/lib/auth-client';
import { UserMenu } from '../UserMenu';
import { LayoutDashboard, Users, Package, ShoppingCart, Menu, X, Command } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { data, isPending } = useAuthSession();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isPending) {
    return <div className="h-screen w-full flex items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div></div>;
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
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg text-zinc-900">
          <Command className="w-5 h-5" />
          <span>Gestión MVP</span>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Floating Sidebar (Desktop) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:translate-x-0 md:static md:h-screen md:p-4",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full w-full glass rounded-none md:rounded-3xl flex flex-col overflow-hidden">
          <div className="p-8 hidden md:flex flex-col items-center">
            <div className="w-14 h-14 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-zinc-950/20">
              <Command className="w-7 h-7" />
            </div>
            <h2 className="font-bold text-xl text-zinc-900 tracking-tight">Gestión MVP</h2>
            <div className="mt-3 px-3 py-1 bg-zinc-100/80 border border-zinc-200 text-zinc-600 text-xs font-mono font-medium rounded-full uppercase tracking-widest">
              {role}
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0 overflow-y-auto">
            {navItems.map((item, i) => {
              const isActive = location.pathname === item.path || 
                               (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300",
                    isActive 
                      ? "bg-zinc-950 text-white premium-shadow" 
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 hover:translate-x-1"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300", 
                    isActive ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-900 group-hover:scale-110"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 mt-auto">
             <div className="bg-zinc-100/50 rounded-2xl p-4 flex items-center gap-3 border border-zinc-200/50">
                <UserMenu />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-zinc-900 truncate">{data.user.name}</span>
                  <span className="text-xs text-zinc-500 font-mono truncate">{data.user.email}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:py-4 md:pr-4">
        <div className="h-full flex flex-col glass rounded-none md:rounded-3xl overflow-hidden relative">
          <header className="hidden md:flex h-20 items-center justify-between px-10 border-b border-zinc-100/50 sticky top-0 z-10 bg-white/50 backdrop-blur-md">
            <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 'Vista General'}
            </h1>
            <div className="flex items-center gap-4">
               {/* Decorative tech-element */}
               <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-100/50 px-3 py-1.5 rounded-full border border-zinc-200/50">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
