import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Partner } from '@/hooks/usePartners';

interface PartnerFormModalProps {
  partner?: Partner | null;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export function PartnerFormModal({ partner, isOpen, onClose, onSubmit, isPending }: PartnerFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    status: 'Activo'
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        role: partner.role,
        phone: partner.phone || '',
        email: partner.email || '',
        status: partner.status || 'Activo'
      });
    } else {
      setFormData({ name: '', role: '', phone: '', email: '', status: 'Activo' });
    }
  }, [partner, open]);

  const handleOpenChange = (val: boolean) => {
    if (onClose && !val) onClose();
    if (isOpen === undefined) setInternalOpen(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (isOpen === undefined) setInternalOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {isOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Socio
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{partner ? 'Editar Socio' : 'Registrar Socio'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nombre Completo *</Label>
            <Input 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <div className="space-y-2">
            <Label>Rol / Especialidad *</Label>
            <Input 
              required 
              placeholder="Ej. Odontólogo, Asistente..."
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <div className="space-y-2">
            <Label>Correo Electrónico</Label>
            <Input 
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="focus:ring-blue-600/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 mt-2" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Datos'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}