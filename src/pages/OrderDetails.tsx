import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      toast.success('Estado de la orden actualizado');
    },
    onError: () => toast.error('Error al actualizar estado')
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando detalles...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Orden no encontrada</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'bg-amber-100 text-amber-800';
      case 'Pagado': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelado': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Orden #{order.id.split('-')[0].toUpperCase()}
            </h2>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Creada el {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Productos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Precio U.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product?.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${Number(item.unitPrice).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">${Number(item.subtotal).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
              <div className="text-right">
                <span className="text-slate-500 mr-4">Total de la Orden</span>
                <span className="text-2xl font-bold text-slate-900">${Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Cliente</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Nombre:</span> <span className="font-medium text-slate-900">{order.client?.name}</span></p>
              {order.client?.email && <p><span className="text-slate-500">Email:</span> {order.client.email}</p>}
              {order.client?.phone && <p><span className="text-slate-500">Teléfono:</span> {order.client.phone}</p>}
              {order.client?.address && <p><span className="text-slate-500">Dirección:</span> {order.client.address}</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Acciones</h3>
            <div className="space-y-3">
              {order.status === 'Pendiente' && (
                <>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => updateStatusMutation.mutate('Pagado')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Marcar como Pagado
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => updateStatusMutation.mutate('Cancelado')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancelar Orden
                  </Button>
                </>
              )}
              {order.status !== 'Pendiente' && (
                <p className="text-sm text-slate-500 text-center">
                  Esta orden ya ha sido procesada y no puede cambiar de estado.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
