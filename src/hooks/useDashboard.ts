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
      
      try {
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
          throw new Error(data.error);
        }
        return data;
      } catch (e) {
        console.error("Error procesando respuesta del Dashboard:", e);
        toast.error("Error de conexión con el servidor");
        throw new Error("Respuesta inválida del servidor");
      }
    },
    // Limitar reintentos para que no se quede colgado "cargando" indefinidamente
    retry: 1,
    refetchOnWindowFocus: false
  });
}