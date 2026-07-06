import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { cn } from '@/lib/utils';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading } = useOrder(id);
  const updateStatusMutation = useUpdateOrderStatus(id);

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Cargando detalles...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Orden no encontrada</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Pagado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelado': return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')} className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
              Orden #{order.id.split('-')[0].toUpperCase()}
            </h2>
            <Badge variant="outline" className={cn("font-medium", getStatusColor(order.status))}>
              {order.status}
            </Badge>
          </div>
          <p className="text-zinc-500 mt-1">
            Creada el {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/60">
            <h3 className="font-semibold text-zinc-900 mb-4">Productos</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-100 hover:bg-transparent">
                  <TableHead>Producto</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Precio U.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((item: any) => (
                  <TableRow key={item.id} className="border-zinc-100 hover:bg-transparent">
                    <TableCell className="font-medium text-zinc-900">{item.product?.name}</TableCell>
                    <TableCell className="text-zinc-600">{item.quantity}</TableCell>
                    <TableCell className="text-zinc-600 font-mono">${Number(item.unitPrice).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-zinc-900 font-mono">${Number(item.subtotal).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-6 pt-4 border-t border-zinc-100">
              <div className="text-right">
                <span className="text-zinc-500 mr-4">Total de la Orden</span>
                <span className="text-2xl font-bold text-blue-600 font-mono">${Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/60">
            <h3 className="font-semibold text-zinc-900 mb-4">Cliente</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Nombre</span> <span className="font-medium text-zinc-900">{order.client?.name}</span></p>
              {order.client?.email && <p><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Email</span> <span className="text-zinc-700">{order.client.email}</span></p>}
              {order.client?.phone && <p><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Teléfono</span> <span className="text-zinc-700">{order.client.phone}</span></p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/60">
            <h3 className="font-semibold text-zinc-900 mb-4">Acciones</h3>
            <div className="space-y-3">
              {order.status === 'Pendiente' && (
                <>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-1"
                    onClick={() => updateStatusMutation.mutate('Pagado')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Marcar como Pagado
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors"
                    onClick={() => updateStatusMutation.mutate('Cancelado')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancelar Orden
                  </Button>
                </>
              )}
              {order.status !== 'Pendiente' && (
                <div className="bg-zinc-50 p-4 rounded-xl text-sm text-zinc-500 text-center border border-zinc-100">
                  Esta orden ya ha sido procesada y no puede cambiar de estado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
