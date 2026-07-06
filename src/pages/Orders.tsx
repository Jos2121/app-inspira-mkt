import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { OrderList } from './orders/components/OrderList';

export default function Orders() {
  const [search, setSearch] = useState('');
  const { data: orders, isLoading } = useOrders();

  const filteredOrders = Array.isArray(orders) ? orders.filter(o => 
    o.client?.name.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por cliente o ID..." 
            className="pl-9 bg-white border-zinc-200 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 transition-all" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Link to="/orders/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4 mr-2" /> Nueva Orden
          </Button>
        </Link>
      </div>

      <OrderList orders={filteredOrders} isLoading={isLoading} />
    </div>
  );
}
