import { useQuery } from '@tanstack/react-query';

export type DashboardKpis = {
  incomes: number;
  expenses: number;
  balance: number;
  totalPatients: number;
  todayTasks: number;
  totalClients: number;
  activePartners: number;
  totalDiagnostics: number;
};

export function useDashboardKpis() {
  return useQuery<DashboardKpis>({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/kpis');
      if (!res.ok) throw new Error('Error al cargar KPIs');
      return res.json();
    }
  });
}