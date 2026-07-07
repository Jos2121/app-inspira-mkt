import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Briefcase, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserMenu } from '../UserMenu';

export const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'Finanzas', path: '/finance' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: FileText, label: 'Metas', path: '/goals' },
  { icon: Users, label: 'Socios', path: '/socios' },
  { icon: CalendarDays, label: 'Calendario', path: '/calendario' },
];

export function Sidebar({ isAdmin, role, isCollapsed, setIsCollapsed, mobileMenuOpen, setMobileMenuOpen, user }: any) {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 bg-white border-r border-zinc-200 transition-all duration-300 md:relative",
      isCollapsed ? "w-20" : "w-64",
      mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex flex-col h-full">
        <div className="h-20 flex items-center px-6 gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
          {!isCollapsed && <span className="font-bold text-lg text-zinc-900">Inspira</span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-zinc-500 hover:bg-zinc-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2 mb-4">
             <UserMenu />
             {!isCollapsed && (
               <div className="overflow-hidden">
                 <p className="text-sm font-bold truncate">{user.name}</p>
                 <p className="text-xs text-zinc-500">{role}</p>
               </div>
             )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-center" 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}