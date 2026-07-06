import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useCreateOrder } from '@/hooks/useOrders';
import { NewOrderItemTable } from './orders/components/NewOrderItemTable';
import { NewOrderSummary } from './orders/components/NewOrderSummary';

export default function NewOrder() {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const { data: clients } = useClients();
  const { data: products } = useProducts();
  const createOrderMutation = useCreateOrder();

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products?.find((p: any) => p.id === value);
      newItems[index] = { ...newItems[index], productId: value, unitPrice: product ? Number(product.price) : 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = () => {
    if (!clientId) return toast.error('Selecciona un cliente');
    if (items.length === 0) return toast.error('Agrega al menos un producto');
    if (items.some(i => !i.productId || i.quantity <= 0)) return toast.error('Completa los detalles de todos los productos');

    createOrderMutation.mutate({ clientId, items }, {
      onSuccess: () => navigate('/orders')
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')} className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Nueva Orden</h2>
          <p className="text-zinc-500 mt-1">Crea una nueva orden de venta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/60">
            <h3 className="font-semibold text-zinc-900 mb-4">Detalles del Cliente</h3>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="focus:ring-blue-600/20 focus:border-blue-600">
                <SelectValue placeholder="Seleccionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <NewOrderItemTable 
            items={items} 
            products={products || []} 
            onAddItem={addItem} 
            onUpdateItem={updateItem} 
            onRemoveItem={removeItem} 
          />
        </div>

        <div className="lg:col-span-1">
          <NewOrderSummary 
            total={total} 
            onSubmit={handleSubmit} 
            isPending={createOrderMutation.isPending} 
          />
        </div>
      </div>
    </div>
  );
}
