import { DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';
import { useDashboardKpis } from '@/hooks/useDashboard';
import { KpiCard } from './dashboard/components/KpiCard';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const { data: kpis, isLoading } = useDashboardKpis();

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
        <p className="text-zinc-500 mt-2 font-medium">Resumen general de tu negocio en el mes actual.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Facturación Mensual"
          value={kpis?.revenue ? formatCurrency(kpis.revenue) : formatCurrency(0)}
          icon={DollarSign}
          isLoading={isLoading}
          delay="100ms"
        />
        <KpiCard
          title="Por Cobrar"
          value={kpis?.receivables ? formatCurrency(kpis.receivables) : formatCurrency(0)}
          icon={Activity}
          isLoading={isLoading}
          delay="200ms"
        />
        <KpiCard
          title="Ventas (Mes)"
          value={kpis?.salesCount || '0'}
          icon={ShoppingBag}
          isLoading={isLoading}
          delay="300ms"
        />
        <KpiCard
          title="Ticket Promedio"
          value={kpis?.avgTicket ? formatCurrency(kpis.avgTicket) : formatCurrency(0)}
          icon={Users}
          isLoading={isLoading}
          delay="400ms"
        />
      </div>
    </div>
  );
}
