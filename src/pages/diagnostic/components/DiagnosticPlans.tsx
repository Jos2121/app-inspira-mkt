import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, GripVertical, Settings2 } from 'lucide-react';
import { useAgencyPlans, useCreateAgencyPlan, useDeleteAgencyPlan } from '@/hooks/useDiagnostic';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export function DiagnosticPlans() {
  const [open, setOpen] = useState(false);
  const { data: plans = [], isLoading } = useAgencyPlans();
  const createPlan = useCreateAgencyPlan();
  const deletePlan = useDeleteAgencyPlan();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [benefits, setBenefits] = useState<string[]>(['']);

  const handleAddBenefit = () => setBenefits([...benefits, '']);
  
  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const handleRemoveBenefit = (index: number) => {
    if (benefits.length === 1) return;
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validBenefits = benefits.filter(b => b.trim() !== '');
    const priceNum = parseFloat(price);

    if (!name.trim() || validBenefits.length === 0 || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Completa el nombre, precio y al menos un beneficio válido.');
      return;
    }

    createPlan.mutate({ name, price: priceNum, benefits: validBenefits }, {
      onSuccess: () => {
        setName('');
        setPrice('');
        setBenefits(['']);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/50 border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm rounded-xl">
          <Settings2 className="w-4 h-4 mr-2" /> Configurar Planes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] rounded-[2rem] max-h-[85vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Planes de la Agencia</DialogTitle>
          <p className="text-sm text-zinc-500">Define los planes que el algoritmo podrá sugerir.</p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Formulario */}
          <div className="bg-zinc-50/80 p-5 rounded-2xl border border-zinc-200/60">
            <h3 className="font-semibold text-zinc-900 mb-4 text-sm uppercase tracking-wide">Crear Plan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Plan</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Plan Pro WhatsApp" className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label>Precio Mensual (PEN)</Label>
                <Input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" min="1" placeholder="990.00" className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label>Beneficios a solucionar</Label>
                {benefits.map((ben, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Input value={ben} onChange={e => handleBenefitChange(idx, e.target.value)} placeholder="Ej. Gestión de Leads" className="bg-white text-sm h-9" />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-red-500" onClick={() => handleRemoveBenefit(idx)} disabled={benefits.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={handleAddBenefit} className="text-blue-600 mt-1 h-8 w-full border border-dashed border-blue-200">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Añadir Beneficio
                </Button>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 mt-2" disabled={createPlan.isPending}>
                {createPlan.isPending ? 'Guardando...' : 'Guardar Plan'}
              </Button>
            </form>
          </div>

          {/* Lista */}
          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-900 mb-4 text-sm uppercase tracking-wide">Planes Activos ({plans.length})</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-2"><div className="h-20 bg-zinc-100 rounded-xl"></div></div>
            ) : plans.length === 0 ? (
              <p className="text-sm text-zinc-500">Aún no hay planes.</p>
            ) : (
              <div className="space-y-3">
                {plans.map(p => (
                  <div key={p.id} className="bg-white border border-zinc-200 p-3 rounded-xl shadow-sm relative group">
                    <Button variant="ghost" size="icon" onClick={() => { if(confirm('¿Eliminar plan?')) deletePlan.mutate(p.id); }} className="absolute top-2 right-2 h-7 w-7 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <h4 className="font-bold text-zinc-900 pr-8 leading-tight">{p.name}</h4>
                    <p className="text-sm font-mono text-emerald-600 font-semibold mb-2">{formatCurrency(p.price)}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.benefits.map((b, i) => (
                        <span key={i} className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded truncate max-w-full">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}