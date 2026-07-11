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
  return useQuery<DashboardKpis, Error>({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/kpis');
        
        // Si el servidor falla (ej. 500), extraemos el mensaje de error del JSON
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error HTTP ${res.status}`);
        }
        
        const data = await res.json();
        return data;
      } catch (err: any) {
        toast.error(err.message || 'Error cargando las métricas del dashboard');
        throw err; // Lanza el error para activar el estado isError de React Query
      }
    },
    retry: 1, // Solo 1 reintento para evitar bloqueos largos
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // Caché de 30 segundos
  });
}