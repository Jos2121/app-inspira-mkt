import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Order } from '@/hooks/useOrders';
import { cn } from '@/lib/utils';

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
}

export function OrderList({ orders, isLoading }: OrderListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200';
      case 'Pagado': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200';
      case 'Cancelado': return 'bg-zinc-100 text-zinc-800 hover:bg-zinc-100 border-zinc-200';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
            <TableHead>ID Orden</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500">Cargando órdenes...</TableCell></TableRow>
          ) : orders.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500">No se encontraron órdenes</TableCell></TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                <TableCell className="font-mono text-zinc-600 font-medium">
                  {order.id.split('-')[0].toUpperCase()}
                </TableCell>
                <TableCell className="text-zinc-600">{format(new Date(order.createdAt), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="font-medium text-zinc-900">{order.client?.name}</TableCell>
                <TableCell className="font-mono font-bold text-zinc-900">${Number(order.total).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-medium", getStatusColor(order.status))}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
