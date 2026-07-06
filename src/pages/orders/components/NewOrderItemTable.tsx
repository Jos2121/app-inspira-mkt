import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { Product } from '@/hooks/useProducts';

interface NewOrderItemTableProps {
  items: any[];
  products: Product[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: string, value: any) => void;
  onRemoveItem: (index: number) => void;
}

export function NewOrderItemTable({ items, products, onAddItem, onUpdateItem, onRemoveItem }: NewOrderItemTableProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/60">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-zinc-900">Productos</h3>
        <Button variant="outline" size="sm" onClick={onAddItem} className="border-blue-200 text-blue-700 hover:bg-blue-50">
          <Plus className="w-4 h-4 mr-2" /> Agregar Producto
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="min-w-[200px]">Producto</TableHead>
              <TableHead className="w-24">Cant.</TableHead>
              <TableHead className="w-32">Precio</TableHead>
              <TableHead className="w-32">Subtotal</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-zinc-500 py-6">No hay productos agregados</TableCell></TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index} className="hover:bg-transparent border-zinc-100">
                  <TableCell>
                    <Select value={item.productId} onValueChange={(val) => onUpdateItem(index, 'productId', val)}>
                      <SelectTrigger className="focus:ring-blue-600/20">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
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
                      className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600"
                      onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)} 
                    />
                  </TableCell>
                  <TableCell className="text-zinc-600 font-mono">${item.unitPrice.toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-zinc-900 font-mono">${(item.quantity * item.unitPrice).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onRemoveItem(index)}>
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
  );
}
