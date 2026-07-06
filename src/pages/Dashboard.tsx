import { useAuthSession } from '@/lib/auth-client';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { data } = useAuthSession();
  
  if (data?.user?.role === 'Operador') {
    return <Navigate to="/orders" replace />;
  }

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/kpis');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Resumen general de tu negocio en el mes actual.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Facturación Mensual" 
          value={kpis?.revenue ? `$${kpis.revenue.toLocaleString()}` : '$0.00'} 
          icon={DollarSign} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Por Cobrar" 
          value={kpis?.receivables ? `$${kpis.receivables.toLocaleString()}` : '$0.00'} 
          icon={Activity} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Ventas (Mes)" 
          value={kpis?.salesCount || '0'} 
          icon={ShoppingBag} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Ticket Promedio" 
          value={kpis?.avgTicket ? `$${kpis.avgTicket.toLocaleString()}` : '$0.00'} 
          icon={Users} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, isLoading }: any) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
        ) : (
          <div className="text-2xl font-bold text-slate-900">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
