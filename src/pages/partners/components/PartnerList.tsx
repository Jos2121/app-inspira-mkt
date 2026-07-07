import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Partner } from '@/hooks/usePartners';

interface PartnerListProps {
  partners: Partner[];
  isLoading: boolean;
  onEdit: (p: Partner) => void;
  onDelete: (id: string) => void;
}

export function PartnerList({ partners, isLoading, onEdit, onDelete }: PartnerListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/50">
            <TableHead>Nombre y Rol</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-500">Cargando socios...</TableCell></TableRow>
          ) : partners.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-500">No hay socios registrados</TableCell></TableRow>
          ) : (
            partners.map(partner => (
              <TableRow key={partner.id} className="hover:bg-zinc-50/50 transition-colors">
                <TableCell>
                  <div className="font-semibold text-zinc-900">{partner.name}</div>
                  <div className="text-sm text-zinc-500">{partner.role}</div>
                </TableCell>
                <TableCell className="font-mono text-sm text-zinc-600">{partner.phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={partner.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500'}>
                    {partner.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50" onClick={() => onEdit(partner)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => { if(confirm('¿Eliminar socio?')) onDelete(partner.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}