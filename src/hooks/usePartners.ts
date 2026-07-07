import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type Partner = { id: string; name: string; role: string; phone: string; status: string; };

export function usePartners() {
  return useQuery<Partner[]>({
    queryKey: ['partners'],
    queryFn: async () => {
      const res = await fetch('/api/partners');
      return res.json();
    }
  });
}
// ... (añadir mutaciones de creación/edición)