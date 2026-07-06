import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Orders() {
  const [search, setSearch] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      return res.json();
    }
  });

  const filteredOrders = orders?.filter((o: any) => 
    o.client?.name.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'Pagado': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'Cancelado': return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por cliente o ID..." 
            className="pl-9 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Link to="/orders/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Nueva Orden
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
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
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Cargando...</TableCell></TableRow>
            ) : filteredOrders?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No se encontraron órdenes</TableCell></TableRow>
            ) : (
              filteredOrders?.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-slate-600">
                    {order.id.split('-')[0].toUpperCase()}
                  </TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium text-slate-900">{order.client?.name}</TableCell>
                  <TableCell className="font-semibold">${Number(order.total).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
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
    </div>
  );
}
