import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

interface ProductFormModalProps {
  onSubmit: (data: { name: string; description: string; price: number }) => void;
  isPending: boolean;
}

export function ProductFormModal({ onSubmit, isPending }: ProductFormModalProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" name="name" required className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" name="description" className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio *</Label>
            <Input id="price" name="price" type="number" step="0.01" min="0" required className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
