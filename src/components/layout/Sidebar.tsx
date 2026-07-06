import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, Command, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenu } from '../UserMenu';

export const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'Órdenes', path: '/orders' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: Package, label: 'Productos', path: '/products' },
];

interface SidebarProps {
  isAdmin: boolean;
  role: string;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  user: { name: string; email: string };
}

export function Sidebar({ 
  isAdmin, 
  role, 
  isCollapsed, 
  setIsCollapsed, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  user
}: SidebarProps) {
  const location = useLocation();
  const items = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:p-4",
      mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full w-72",
      isCollapsed ? "md:w-28" : "md:w-72"
    )}>
      <div className="h-full w-full glass rounded-none md:rounded-3xl flex flex-col overflow-hidden relative">
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
            "bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20 transition-all duration-300 flex-shrink-0", 
            isCollapsed ? "w-12 h-12 rounded-xl mb-0" : "w-14 h-14 rounded-2xl mb-4"
          )}>
            <Command className={cn("transition-all duration-300", isCollapsed ? "w-6 h-6" : "w-7 h-7")} />
          </div>
          
          <div className={cn(
            "flex flex-col items-center transition-all duration-300 overflow-hidden", 
            isCollapsed ? "h-0 opacity-0" : "h-16 opacity-100"
          )}>
            <h2 className="font-bold text-xl text-zinc-900 tracking-tight whitespace-nowrap">Gestión MVP</h2>
            <div className="mt-3 px-3 py-1 bg-blue-50/80 border border-blue-200/50 text-blue-700 text-xs font-mono font-bold rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm shadow-blue-500/5">
              {role}
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0 overflow-y-auto overflow-x-hidden">
          {items.map((item, i) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            
            const navLink = (
              <Link
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center rounded-2xl text-sm font-medium transition-all duration-300 overflow-hidden",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                    : "text-zinc-500 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1",
                  isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3.5"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <item.icon className={cn(
                  "transition-transform duration-300 flex-shrink-0", 
                  isCollapsed ? "w-6 h-6" : "w-5 h-5",
                  isActive ? "text-white" : "text-zinc-400 group-hover:text-blue-600 group-hover:scale-110"
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
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
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
                <span className="text-sm font-medium text-zinc-900 truncate">{user.name}</span>
                <span className="text-xs text-zinc-500 font-mono truncate">{user.email}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
