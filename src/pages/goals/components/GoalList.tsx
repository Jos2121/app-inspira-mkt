import { useState } from 'react';
import { useGoals, useDeleteGoal } from '@/hooks/useGoals';
import { useClients } from '@/hooks/useClients';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import { Target, TrendingUp, Users, Trash2, History, Search, X } from 'lucide-react';
import { DailyLogModal } from './DailyLogModal';
import { Button } from '@/components/ui/button';
import { LogHistoryModal } from './LogHistoryModal';
import { formatLocalDateString } from '@/lib/date-utils';
import { Input } from '@/components/ui/input';

export function GoalList() {
  const { data: goals = [], isLoading } = useGoals();
  const deleteMutation = useDeleteGoal();
  const { data: clients } = useClients();

  const [historyGoal, setHistoryGoal] = useState<any | null>(null);
  
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  if (isLoading) {
    return (
      <div className="text-center py-20 bg-white/40 glass rounded-3xl border border-dashed border-zinc-200/60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-500 font-medium">Cargando metas...</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-20 bg-white/40 glass rounded-3xl border border-dashed border-zinc-200/60">
        <Target className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900">No hay metas activas</h3>
        <p className="text-zinc-500 mt-1">Crea una nueva meta para comenzar el seguimiento.</p>
      </div>
    );
  }

  // Filtrar las metas basándonos en la búsqueda y el mes seleccionado
  const filteredGoals = goals.filter((goal) => {
    const client = clients?.find(c => c.id === goal.clientId);
    const clientName = client?.name || '';
    
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = monthFilter ? goal.monthYear === monthFilter : true;
    
    return matchesSearch && matchesMonth;
  });

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Buscar por cliente..." 
              className="pl-9 bg-white border-zinc-200 focus-visible:ring-blue-600/20 focus-visible:border-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto flex items-center gap-2">
            <Input 
              type="month" 
              className="bg-white border-zinc-200 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 w-full sm:w-[180px]"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
            {monthFilter && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMonthFilter('')} 
                className="text-zinc-400 hover:text-red-500 hover:bg-red-50"
                title="Limpiar mes"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-zinc-500 font-medium">
          {filteredGoals.length} {filteredGoals.length === 1 ? 'resultado' : 'resultados'}
        </div>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="text-center py-16 bg-white/40 glass rounded-3xl border border-dashed border-zinc-200/60">
          <p className="text-zinc-500 font-medium text-lg">No se encontraron metas que coincidan con los filtros.</p>
          <Button variant="link" onClick={() => {setSearchTerm(''); setMonthFilter('');}} className="mt-2 text-blue-600">
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const client = clients?.find(c => c.id === goal.clientId);
            const currentPatients = goal.dailyLogs?.reduce((acc: number, log: any) => acc + log.count, 0) || 0;
            const progressPercentage = Math.min((currentPatients / goal.targetPatients) * 100, 100);
            
            const costVal = Number(goal.costPerPatient);
            const earnedMoney = currentPatients * costVal;
            const projectedMoney = goal.targetPatients * costVal;
            
            const progressColor = progressPercentage >= 100 ? "[&>div]:bg-emerald-500" : progressPercentage > 50 ? "[&>div]:bg-blue-500" : "[&>div]:bg-amber-500";
            const badgeColor = progressPercentage >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700";

            return (
              <div key={goal.id} className="glass rounded-[2rem] p-6 shadow-sm border border-zinc-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", badgeColor)}>
                      {formatLocalDateString(goal.monthYear, 'MMMM yyyy')}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 mt-3 truncate pr-4">
                      {client?.name || 'Cargando cliente...'}
                    </h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 -mt-2 -mr-2"
                    onClick={() => { if(confirm('¿Eliminar esta meta?')) deleteMutation.mutate(goal.id); }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="text-zinc-500 flex items-center gap-1.5"><Users className="w-4 h-4"/> Pacientes</span>
                      <span className="text-zinc-900 font-mono">
                        {currentPatients} / {goal.targetPatients}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className={cn("h-2.5 bg-zinc-100", progressColor)} />
                    <div className="flex justify-end mt-1 text-xs font-bold text-zinc-400">
                      {progressPercentage.toFixed(1)}% Completado
                    </div>
                  </div>

                  <div className="bg-zinc-50/50 rounded-xl p-4 border border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", progressPercentage >= 100 ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Acumulado</p>
                        <p className="text-lg font-bold text-zinc-900 font-mono">
                          {formatCurrency(earnedMoney)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Proyección</p>
                      <p className="text-sm font-bold text-zinc-400 font-mono">
                        {formatCurrency(projectedMoney)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-9 rounded-xl border-zinc-200 text-zinc-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                      onClick={() => setHistoryGoal(goal)}
                    >
                      <History className="w-3.5 h-3.5 mr-1.5" />
                      Historial ({goal.dailyLogs?.length || 0})
                    </Button>
                    <DailyLogModal goalId={goal.id} />
                  </div>
                </div>
                
                {progressPercentage >= 100 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <LogHistoryModal 
        goal={historyGoal}
        isOpen={!!historyGoal}
        onClose={() => setHistoryGoal(null)}
      />
    </>
  );
}