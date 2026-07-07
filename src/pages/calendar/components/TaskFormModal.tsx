import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { usePartners } from '@/hooks/usePartners';
import { Task } from '@/hooks/useTasks';
import { Trash2 } from 'lucide-react';

interface TaskFormModalProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onDelete?: (id: string) => void;
  isPending: boolean;
  isDeleting?: boolean;
  selectedDate?: Date; // Si se clickea un día vacío
}

export function TaskFormModal({ task, isOpen, onClose, onSubmit, onDelete, isPending, isDeleting, selectedDate }: TaskFormModalProps) {
  const { data: clients = [] } = useClients();
  const { data: partners = [] } = usePartners();
  
  // Format for datetime-local: YYYY-MM-DDThh:mm
  const formatForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: formatForInput(new Date()),
    endTime: formatForInput(new Date(Date.now() + 3600000)), // +1 hora
    partnerId: 'none',
    clientId: 'none',
    status: 'Pendiente'
  });

  const isEditMode = !!task;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        startTime: task.startTime,
        endTime: task.endTime,
        partnerId: task.partnerId || 'none',
        clientId: task.clientId || 'none',
        status: task.status
      });
    } else {
      const start = selectedDate ? new Date(selectedDate) : new Date();
      if (selectedDate) start.setHours(9, 0, 0, 0); // Default a 9 AM
      const end = new Date(start.getTime() + 3600000);
      
      setFormData({
        title: '',
        description: '',
        startTime: formatForInput(start),
        endTime: formatForInput(end),
        partnerId: 'none',
        clientId: 'none',
        status: 'Pendiente'
      });
    }
  }, [task, isOpen, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      partnerId: formData.partnerId === 'none' ? null : formData.partnerId,
      clientId: formData.clientId === 'none' ? null : formData.clientId,
    });
  };

  const handleDelete = () => {
    if (task && onDelete && window.confirm('¿Estás seguro que deseas eliminar esta tarea permanentemente?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditMode ? 'Detalles de la Tarea' : 'Nueva Tarea'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Título {isEditMode ? '' : '*'}</Label>
            <Input 
              required 
              disabled={isEditMode}
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="focus-visible:ring-blue-600/20 disabled:opacity-80 disabled:bg-zinc-50" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input 
              disabled={isEditMode}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="focus-visible:ring-blue-600/20 disabled:opacity-80 disabled:bg-zinc-50"
              placeholder={isEditMode ? "Sin descripción" : "Opcional..."}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inicio {isEditMode ? '' : '*'}</Label>
              <Input 
                type="datetime-local" 
                required 
                disabled={isEditMode}
                value={formData.startTime} 
                onChange={e => setFormData({...formData, startTime: e.target.value})} 
                className="disabled:opacity-80 disabled:bg-zinc-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Fin {isEditMode ? '' : '*'}</Label>
              <Input 
                type="datetime-local" 
                required 
                disabled={isEditMode}
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="disabled:opacity-80 disabled:bg-zinc-50" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Asignado a</Label>
              <Select disabled={isEditMode} value={formData.partnerId} onValueChange={v => setFormData({...formData, partnerId: v})}>
                <SelectTrigger className="disabled:opacity-80 disabled:bg-zinc-50"><SelectValue placeholder="Socio..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select disabled={isEditMode} value={formData.clientId} onValueChange={v => setFormData({...formData, clientId: v})}>
                <SelectTrigger className="disabled:opacity-80 disabled:bg-zinc-50"><SelectValue placeholder="Cliente..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Estado de la Tarea</Label>
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
              <SelectTrigger className="border-blue-200 bg-blue-50/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-2">
            {isEditMode && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? 'Guardando...' : (isEditMode ? 'Actualizar Estado' : 'Guardar Tarea')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}