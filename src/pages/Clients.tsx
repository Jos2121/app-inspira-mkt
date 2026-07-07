import { useState } from 'react';
import { useAuthSession } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useClients, useCreateClient, useDeleteClient, useUpdateClient, Client } from '@/hooks/useClients';
import { ClientList } from './clients/components/ClientList';
import { ClientFormModal } from './clients/components/ClientFormModal';
import { EditClientModal } from './clients/components/EditClientModal';

export default function Clients() {
  const { data: session } = useAuthSession();
  const isAdmin = session?.user?.role === 'Admin';
  
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useClients();
  const createMutation = useCreateClient();
  const deleteMutation = useDeleteClient();
  const updateMutation = useUpdateClient();

  const filteredClients = Array.isArray(clients) ? clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  ) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Directorio de Clientes</h2>
          <p className="text-zinc-500 mt-1 font-medium">Gestiona y visualiza la información de tus pacientes o clientes.</p>
        </div>
        
        <ClientFormModal 
          onSubmit={(data) => createMutation.mutate(data)} 
          isPending={createMutation.isPending} 
        />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <Input 
          placeholder="Buscar clientes por nombre o email..." 
          className="pl-9 bg-white shadow-sm focus-visible:ring-blue-600/20 focus-visible:border-blue-600 transition-all" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ClientList 
        clients={filteredClients} 
        isLoading={isLoading} 
        isAdmin={isAdmin} 
        onDelete={(id) => deleteMutation.mutate(id)} 
        onEdit={(client) => setEditingClient(client)}
      />

      {/* Modal de edición */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          onSubmit={(data) => updateMutation.mutate(
            { id: editingClient.id, data },
            { onSuccess: () => setEditingClient(null) }
          )}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}