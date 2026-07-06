import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Product } from '@/hooks/useProducts';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export function ProductList({ products, isLoading, isAdmin, onDelete }: ProductListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-500">Cargando productos...</TableCell></TableRow>
          ) : products.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-500">No se encontraron productos</TableCell></TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                <TableCell className="font-medium text-zinc-900">{product.name}</TableCell>
                <TableCell className="text-zinc-600">{product.description || '-'}</TableCell>
                <TableCell className="font-mono font-medium text-zinc-900">${Number(product.price).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('¿Eliminar producto?')) onDelete(product.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
