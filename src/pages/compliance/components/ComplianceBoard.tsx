import { useState } from 'react';
import { useComplianceRecords } from '@/hooks/useCompliance';
import { ComplianceCard } from './ComplianceCard';
import { Input } from '@/components/ui/input';
import { Search, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentDateLimaISO } from '@/lib/date-utils';

export function ComplianceBoard() {
  const { data: records = [], isLoading } = useComplianceRecords();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState(getCurrentDateLimaISO().substring(0, 7)); // Por defecto mes actual

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-zinc-100/50 rounded-[2rem] animate-pulse"></div>)}
      </div>
    );
  }

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.client?.name.toLowerCase().includes(search.toLowerCase()) || 
                          r.plan?.name.toLowerCase().includes(search.toLowerCase());
    const matchesMonth = monthFilter ? r.monthYear === monthFilter : true;
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por cliente o plan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white focus-visible:ring-blue-600/20"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            type="month" 
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-white focus-visible:ring-blue-600/20 w-full sm:w-44"
          />
          {monthFilter && (
            <Button variant="ghost" size="icon" onClick={() => setMonthFilter('')} className="text-zinc-400 hover:text-red-500 hover:bg-red-50 shrink-0">
              <FilterX className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Cuadrícula */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-20 glass rounded-[2rem] border-dashed border-zinc-200/80">
          <p className="text-zinc-500 font-medium text-lg">No hay asignaciones para los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map(record => (
            <ComplianceCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}