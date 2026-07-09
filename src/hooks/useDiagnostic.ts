import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type AgencyPlan = {
  id: string;
  name: string;
  price: string | number;
  benefits: string[];
  createdAt: string;
};

export type Prospect = {
  name: string;
  whatsapp: string;
  dateLimaISO: string;
};

export type DiagnosticResultType = {
  recommendedPlan: AgencyPlan | null;
  matchPercentage: number;
  painPointsSolved: string[];
  totalPainPoints: number;
};

// --- CRUD Planes de Agencia ---
export function useAgencyPlans() {
  return useQuery<AgencyPlan[]>({
    queryKey: ['agency-plans'],
    queryFn: async () => {
      const res = await fetch('/api/diagnostic-plans');
      if (!res.ok) throw new Error('Error al cargar planes de agencia');
      return res.json();
    }
  });
}

export function useCreateAgencyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; price: number; benefits: string[] }) => {
      const res = await fetch('/api/diagnostic-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear el plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-plans'] });
      toast.success('Plan guardado exitosamente');
    },
    onError: () => toast.error('Error al crear plan')
  });
}

export function useDeleteAgencyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/diagnostic-plans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error interno al eliminar el plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-plans'] });
      toast.success('Plan eliminado');
    },
    onError: (error) => toast.error(error.message)
  });
}

// --- Algoritmo de Diagnóstico ---
export function calculateBestPlan(plans: AgencyPlan[], scores: Record<string, number>): DiagnosticResultType {
  // 1. Identificar Puntos de Dolor (Calificación <= 4)
  const painPoints = Object.entries(scores)
    .filter(([_, score]) => score <= 4)
    .map(([benefit]) => benefit);

  if (painPoints.length === 0) {
    return { recommendedPlan: null, matchPercentage: 0, painPointsSolved: [], totalPainPoints: 0 };
  }

  let bestPlan: AgencyPlan | null = null;
  let maxPainPointsSolved: string[] = [];

  // 2. Iterar planes para ver cuál resuelve más puntos de dolor
  plans.forEach(plan => {
    const solved = plan.benefits.filter(benefit => painPoints.includes(benefit));
    
    if (solved.length > maxPainPointsSolved.length) {
      maxPainPointsSolved = solved;
      bestPlan = plan;
    }
  });

  // Si ningún plan resuelve ningún punto de dolor
  if (!bestPlan || maxPainPointsSolved.length === 0) {
    return { recommendedPlan: null, matchPercentage: 0, painPointsSolved: [], totalPainPoints: painPoints.length };
  }

  // 3. Calcular porcentaje de coincidencia (Cuántos de sus problemas resuelvo)
  const matchPercentage = Math.round((maxPainPointsSolved.length / painPoints.length) * 100);

  return {
    recommendedPlan: bestPlan,
    matchPercentage,
    painPointsSolved: maxPainPointsSolved,
    totalPainPoints: painPoints.length,
  };
}