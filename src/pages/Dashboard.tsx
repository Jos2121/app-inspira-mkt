import { TrendingUp, TrendingDown, Wallet, Users, CalendarDays, Briefcase, UserCheck, Activity, AlertCircle } from 'lucide-react';
import { useDashboardKpis } from '@/hooks/useDashboard';
import { KpiCard } from './dashboard/components/KpiCard';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Dashboard() {
  const { data: kpis, isLoading, isError, error, refetch } = useDashboardKpis();

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
        <p className="text-zinc-500 mt-2 font-medium">Resumen general de tu negocio en el mes actual.</p>
      </div>

      {isError ? (
        // ESTADO DE ERROR: Evita pantallas en blanco
        <Alert variant="destructive" className="bg-red-50/80 border-red-200 backdrop-blur-xl animate-in fade-in">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold text-red-800">Error al cargar las métricas</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 text-red-700 mt-2">
            <p>{error?.message || "Ocurrió un problema inesperado al obtener los datos del servidor."}</p>
            <button 
              onClick={() => refetch()} 
              className="w-fit text-sm font-bold bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        // ESTADO DE CARGA: Skeleton (Glassmorphism) de shadcn/ui
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-[160px] w-full rounded-[2rem] bg-zinc-200/40 backdrop-blur-sm" 
            />
          ))}
        </div>
      ) : (
        // ESTADO DE ÉXITO: Renderizado de las tarjetas con formateo PEN
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Ingresos (Mes)"
            value={formatCurrency(kpis?.incomes ?? 0)}
            icon={TrendingUp}
            delay="100ms"
            colorVariant="emerald"
          />
          <KpiCard
            title="Gastos (Mes)"
            value={formatCurrency(kpis?.expenses ?? 0)}
            icon={TrendingDown}
            delay="200ms"
            colorVariant="rose"
          />
          <KpiCard
            title="Utilidad (Mes)"
            value={formatCurrency(kpis?.balance ?? 0)}
            icon={Wallet}
            delay="300ms"
            colorVariant="blue"
          />
          <KpiCard
            title="Total Pacientes (Mes)"
            value={kpis?.totalPatients ?? 0}
            icon={Users}
            delay="400ms"
            colorVariant="indigo"
          />
          
          <KpiCard
            title="Tareas de Hoy"
            value={kpis?.todayTasks ?? 0}
            subtitle="Hoy"
            icon={CalendarDays}
            delay="500ms"
            colorVariant="amber"
          />
          <KpiCard
            title="Total Clientes"
            value={kpis?.totalClients ?? 0}
            subtitle="General"
            icon={Briefcase}
            delay="600ms"
            colorVariant="blue"
          />
          <KpiCard
            title="Staff Activo"
            value={kpis?.activePartners ?? 0}
            subtitle="General"
            icon={UserCheck}
            delay="700ms"
            colorVariant="emerald"
          />
          <KpiCard
            title="Diagnósticos"
            value={kpis?.totalDiagnostics ?? 0}
            subtitle="General"
            icon={Activity}
            delay="800ms"
            colorVariant="violet"
          />
        </div>
      )}
    </div>
  );
}