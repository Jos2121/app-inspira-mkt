import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

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
      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    refetchOnMount: true,       // Obliga a refetch siempre que entras a la pantalla
    refetchOnWindowFocus: true, // Recarga si sales de la pestaña y vuelves
    staleTime: 0,               // Los datos expiran de inmediato en caché
  });
}