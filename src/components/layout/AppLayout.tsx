import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthSession } from '@/lib/auth-client';
import { UserMenu } from '../UserMenu';
import { LayoutDashboard, Users, Package, ShoppingCart, Menu, X, Command, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const navItems = [
    ...(isAdmin ? [{ icon: LayoutDashboard, label: 'Dashboard', path: '/' }] : []),
    { icon: ShoppingCart, label: 'Órdenes', path: '/orders' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Package, label: 'Productos', path: '/products' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 overflow-hidden">
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

      {/* Floating Sidebar (Desktop: Collapsible, Mobile: Drawer) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:p-4",
        mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full w-72",
        isCollapsed ? "md:w-28" : "md:w-72"
      )}>
        <div className="h-full w-full glass rounded-none md:rounded-3xl flex flex-col overflow-hidden relative">
          
          {/* Collapse Toggle Button (Desktop only) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 hidden md:flex text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 z-10 rounded-xl"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </Button>

          <div className={cn("p-8 hidden md:flex flex-col items-center transition-all duration-300", isCollapsed ? "p-4 mt-10" : "")}>
            <div className={cn(
              "bg-zinc-950 text-white flex items-center justify-center shadow-xl shadow-zinc-950/20 transition-all duration-300 flex-shrink-0", 
              isCollapsed ? "w-12 h-12 rounded-xl mb-0" : "w-14 h-14 rounded-2xl mb-4"
            )}>
              <Command className={cn("transition-all duration-300", isCollapsed ? "w-6 h-6" : "w-7 h-7")} />
            </div>
            
            <div className={cn(
              "flex flex-col items-center transition-all duration-300 overflow-hidden", 
              isCollapsed ? "h-0 opacity-0" : "h-16 opacity-100"
            )}>
              <h2 className="font-bold text-xl text-zinc-900 tracking-tight whitespace-nowrap">Gestión MVP</h2>
              <div className="mt-3 px-3 py-1 bg-zinc-100/80 border border-zinc-200 text-zinc-600 text-xs font-mono font-medium rounded-full uppercase tracking-widest whitespace-nowrap">
                {role}
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0 overflow-y-auto overflow-x-hidden">
            {navItems.map((item, i) => {
              const isActive = location.pathname === item.path || 
                               (item.path !== '/' && location.pathname.startsWith(item.path));
              
              const navLink = (
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center rounded-2xl text-sm font-medium transition-all duration-300 overflow-hidden",
                    isActive 
                      ? "bg-zinc-950 text-white premium-shadow" 
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 hover:translate-x-1",
                    isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3.5"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <item.icon className={cn(
                    "transition-transform duration-300 flex-shrink-0", 
                    isCollapsed ? "w-6 h-6" : "w-5 h-5",
                    isActive ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-900 group-hover:scale-110"
                  )} />
                  <span className={cn(
                    "transition-all duration-300 whitespace-nowrap",
                    isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );

              if (isCollapsed) {
                return (
                  <div key={item.path} className="flex justify-center">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        {navLink}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-zinc-950 text-zinc-50 font-medium border-none ml-2">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              }

              return <div key={item.path}>{navLink}</div>;
            })}
          </nav>
          
          <div className="p-4 mt-auto">
             <div className={cn(
               "bg-zinc-100/50 rounded-2xl flex items-center border border-zinc-200/50 transition-all duration-300 overflow-hidden",
               isCollapsed ? "p-2 justify-center" : "p-4 gap-3"
             )}>
                <UserMenu />
                <div className={cn(
                  "flex flex-col transition-all duration-300 whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"
                )}>
                  <span className="text-sm font-medium text-zinc-900 truncate">{data.user.name}</span>
                  <span className="text-xs text-zinc-500 font-mono truncate">{data.user.email}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:py-4 md:pr-4 transition-all duration-300">
        <div className="h-full flex flex-col glass rounded-none md:rounded-3xl overflow-hidden relative">
          <header className="hidden md:flex h-20 items-center justify-between px-10 border-b border-zinc-100/50 sticky top-0 z-10 bg-white/50 backdrop-blur-md">
            <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 'Vista General'}
            </h1>
            <div className="flex items-center gap-4">
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
