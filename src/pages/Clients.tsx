import { useState } from 'react';
import { useAuthSession } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useClients, useCreateClient, useDeleteClient } from '@/hooks/useClients';
import { ClientList } from './clients/components/ClientList';
import { ClientFormModal } from './clients/components/ClientFormModal';

export default function Clients() {
  const { data: session } = useAuthSession();
  const isAdmin = session?.user?.role === 'Admin';
  const [search, setSearch] = useState('');

  const { data: clients, isLoading } = useClients();
  const createMutation = useCreateClient();
  const deleteMutation = useDeleteClient();

  const filteredClients = Array.isArray(clients) ? clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar clientes..." 
            className="pl-9 bg-white border-zinc-200 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 transition-all" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <ClientFormModal 
          onSubmit={(data) => createMutation.mutate(data)} 
          isPending={createMutation.isPending} 
        />
      </div>

      <ClientList 
        clients={filteredClients} 
        isLoading={isLoading} 
        isAdmin={isAdmin} 
        onDelete={(id) => deleteMutation.mutate(id)} 
      />
    </div>
  );
}
