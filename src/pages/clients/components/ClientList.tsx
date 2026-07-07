import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { Client } from '@/hooks/useClients';

interface ClientListProps {
  clients: Client[];
  isLoading: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit: (client: Client) => void;
}

export function ClientList({ clients, isLoading, isAdmin, onDelete, onEdit }: ClientListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-500">Cargando clientes...</TableCell></TableRow>
          ) : clients.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-500">No se encontraron clientes</TableCell></TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id} className="hover:bg-zinc-50/50 transition-colors">
                <TableCell className="font-medium text-zinc-900">{client.name}</TableCell>
                <TableCell className="text-zinc-600">{client.email || '-'}</TableCell>
                <TableCell className="text-zinc-600 font-mono text-sm">{client.phone || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onEdit(client)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('¿Eliminar cliente? Todas sus órdenes y metas también serán eliminadas.')) onDelete(client.id);
                      }}
                    >
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