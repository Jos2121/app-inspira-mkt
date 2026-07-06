import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  product?: { name: string };
};

export type Order = {
  id: string;
  clientId: string;
  status: string;
  total: string | number;
  createdAt: string;
  client?: { id: string; name: string; email?: string; phone?: string; address?: string };
  items?: OrderItem[];
};

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Error al cargar órdenes');
      return res.json();
    }
  });
}

export function useOrder(id?: string) {
  return useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Orden no encontrada');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: { clientId: string; items: any[] }) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error('Error al crear orden');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Orden creada exitosamente');
    },
    onError: () => toast.error('Error al crear orden')
  });
}

export function useUpdateOrderStatus(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: string) => {
      if (!id) throw new Error('ID is required');
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al actualizar estado')
  });
}
