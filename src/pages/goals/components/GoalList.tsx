import { useState } from 'react';
import { useGoals, useDeleteGoal } from '@/hooks/useGoals';
import { useClients } from '@/hooks/useClients';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Target, TrendingUp, Users, Trash2, History } from 'lucide-react';
import { DailyLogModal } from './DailyLogModal';
import { Button } from '@/components/ui/button';
import { LogHistoryModal } from './LogHistoryModal';

export function GoalList() {
  const { data: goals = [], isLoading } = useGoals();
  const deleteMutation = useDeleteGoal();
  const { data: clients } = useClients();

  const [historyGoal, setHistoryGoal] = useState<any | null>(null);

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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const client = clients?.find(c => c.id === goal.clientId);
          const currentPatients = goal.dailyLogs?.reduce((acc: number, log: any) => acc + log.count, 0) || 0;
          const progressPercentage = Math.min((currentPatients / goal.targetPatients) * 100, 100);
          
          const costVal = Number(goal.costPerPatient);
          const earnedMoney = currentPatients * costVal;
          const projectedMoney = goal.targetPatients * costVal;
          
          // Colores dinámicos basados en el progreso
          const progressColor = progressPercentage >= 100 ? "[&>div]:bg-emerald-500" : progressPercentage > 50 ? "[&>div]:bg-blue-500" : "[&>div]:bg-amber-500";
          const badgeColor = progressPercentage >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700";

          return (
            <div key={goal.id} className="glass rounded-[2rem] p-6 shadow-sm border border-zinc-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", badgeColor)}>
                    {format(parseISO(`${goal.monthYear}-01`), 'MMMM yyyy', { locale: es })}
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
                {/* Progress Section */}
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

                {/* Financial Section */}
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

                {/* Actions */}
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
              
              {/* Ambient Background Glow if completed */}
              {progressPercentage >= 100 && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>

      <LogHistoryModal 
        goal={historyGoal}
        isOpen={!!historyGoal}
        onClose={() => setHistoryGoal(null)}
      />
    </>
  );
}