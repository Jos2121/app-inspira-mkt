import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type Partner = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  status: string;
  createdAt: string;
};

export function usePartners() {
  return useQuery<Partner[]>({
    queryKey: ['partners'],
    queryFn: async () => {
      const res = await fetch('/api/partners');
      if (!res.ok) throw new Error('Error al cargar socios');
      return res.json();
    }
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Partner, 'id' | 'createdAt'>) => {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Socio registrado');
    },
    onError: () => toast.error('Error al crear socio')
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partner> }) => {
      const res = await fetch(`/api/partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Socio actualizado');
    },
    onError: () => toast.error('Error al actualizar socio')
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Socio eliminado');
    },
    onError: () => toast.error('Error al eliminar socio')
  });
}