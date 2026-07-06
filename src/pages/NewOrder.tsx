import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';

export default function NewOrder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: () => fetch('/api/clients').then(res => res.json()) });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => fetch('/api/products').then(res => res.json()) });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
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
      navigate('/orders');
    },
    onError: () => toast.error('Error al crear orden')
  });

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

    createOrderMutation.mutate({ clientId, items });
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nueva Orden</h2>
          <p className="text-muted-foreground mt-1">Crea una nueva orden de venta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Detalles del Cliente</h3>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900">Productos</h3>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" /> Agregar Producto
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Producto</TableHead>
                    <TableHead className="w-24">Cant.</TableHead>
                    <TableHead className="w-32">Precio</TableHead>
                    <TableHead className="w-32">Subtotal</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-4">No hay productos agregados</TableCell></TableRow>
                  ) : (
                    items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select value={item.productId} onValueChange={(val) => updateItem(index, 'productId', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product: any) => (
                                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="1" 
                            value={item.quantity} 
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} 
                          />
                        </TableCell>
                        <TableCell className="text-slate-600">${item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-slate-900">${(item.quantity * item.unitPrice).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => removeItem(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm sticky top-24">
            <h3 className="font-semibold text-lg mb-6">Resumen de Orden</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Impuestos (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="border-t border-slate-700 my-4"></div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12 text-base font-semibold"
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? 'Procesando...' : 'Confirmar Orden'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
