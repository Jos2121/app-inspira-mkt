import { useState } from 'react';
import { useAuthSession } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct, Product } from '@/hooks/useProducts';
import { ProductList } from './products/components/ProductList';
import { ProductFormModal } from './products/components/ProductFormModal';
import { EditProductModal } from './products/components/EditProductModal';

export default function Products() {
  const { data: session } = useAuthSession();
  const isAdmin = session?.user?.role === 'Admin';
  
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useProducts();
  const createMutation = useCreateProduct();
  const deleteMutation = useDeleteProduct();
  const updateMutation = useUpdateProduct();

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar productos..." 
            className="pl-9 bg-white border-zinc-200 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 transition-all" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <ProductFormModal 
          onSubmit={(data) => createMutation.mutate(data)} 
          isPending={createMutation.isPending} 
        />
      </div>

      <ProductList 
        products={filteredProducts} 
        isLoading={isLoading} 
        isAdmin={isAdmin} 
        onDelete={(id) => deleteMutation.mutate(id)} 
        onEdit={(product) => setEditingProduct(product)}
      />

      {/* Modal de edición */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={(data) => updateMutation.mutate(
            { id: editingProduct.id, data },
            { onSuccess: () => setEditingProduct(null) }
          )}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}