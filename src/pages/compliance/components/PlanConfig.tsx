import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { usePlans, useCreatePlan, useDeletePlan } from '@/hooks/useCompliance';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function PlanConfig() {
  const { data: plans = [], isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const deletePlan = useDeletePlan();

  const [name, setName] = useState('');
  const [activities, setActivities] = useState<string[]>(['']);

  const handleAddActivity = () => {
    setActivities([...activities, '']);
  };

  const handleActivityChange = (index: number, value: string) => {
    const newActivities = [...activities];
    newActivities[index] = value;
    setActivities(newActivities);
  };

  const handleRemoveActivity = (index: number) => {
    if (activities.length === 1) return;
    const newActivities = activities.filter((_, i) => i !== index);
    setActivities(newActivities);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validActivities = activities.filter(a => a.trim() !== '');
    if (!name.trim() || validActivities.length === 0) {
      toast.error('Completa el nombre y al menos una actividad válida.');
      return;
    }

    createPlan.mutate({ name, activities: validActivities }, {
      onSuccess: () => {
        setName('');
        setActivities(['']);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      
      {/* Formulario de Creación */}
      <div className="glass rounded-[2rem] p-6 sm:p-8 shadow-sm border border-zinc-200/60 h-fit">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Crear Nuevo Plan</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="planName" className="text-zinc-600 font-semibold">Nombre del Plan</Label>
            <Input 
              id="planName" 
              placeholder="Ej. Plan Premium Mensual" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/50 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 h-11"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-zinc-600 font-semibold">Actividades o Beneficios</Label>
            <div className="space-y-2">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <GripVertical className="w-5 h-5 text-zinc-300 shrink-0 cursor-grab" />
                  <Input
                    placeholder="Ej. Mantenimiento Preventivo"
                    value={activity}
                    onChange={(e) => handleActivityChange(idx, e.target.value)}
                    className="bg-white/50 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 h-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveActivity(idx)}
                    disabled={activities.length === 1}
                    className="text-zinc-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddActivity}
              className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50/50 rounded-xl w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" /> Agregar ítem
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-xl shadow-lg shadow-blue-600/20"
            disabled={createPlan.isPending}
          >
            {createPlan.isPending ? 'Guardando...' : 'Guardar Plan'}
          </Button>
        </form>
      </div>

      {/* Lista de Planes */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-zinc-900 mb-4 px-2">Planes Existentes</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2].map(i => <div key={i} className="h-32 bg-zinc-200/50 rounded-2xl"></div>)}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 glass rounded-[2rem] border-dashed border-zinc-200">
            <p className="text-zinc-500 font-medium">No hay planes configurados aún.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="glass rounded-[1.5rem] p-5 border border-zinc-200/50 relative group transition-all hover:shadow-md">
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50"
                      title="Eliminar plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar este plan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Asegúrate de que el plan no esté siendo usado por ningún cliente antes de eliminarlo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deletePlan.mutate(plan.id)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <h4 className="font-bold text-zinc-900 text-lg mb-3 pr-8">{plan.name}</h4>
                <ul className="space-y-1.5">
                  {plan.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                      <span className="leading-tight">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}