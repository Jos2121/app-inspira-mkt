import { useState, useMemo } from 'react';
import { useAgencyPlans, Prospect, DiagnosticResultType, calculateBestPlan } from '@/hooks/useDiagnostic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Activity, Phone } from 'lucide-react';
import { getCurrentDateLimaISO } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProspectScorerProps {
  onResult: (result: DiagnosticResultType, prospect: Prospect) => void;
}

export function ProspectScorer({ onResult }: ProspectScorerProps) {
  const { data: plans = [], isLoading } = useAgencyPlans();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});

  // Extraer todos los beneficios únicos de todos los planes
  const uniqueBenefits = useMemo(() => {
    const all = plans.flatMap(p => p.benefits);
    return Array.from(new Set(all));
  }, [plans]);

  // Inicializar scores cuando se cargan los beneficios
  useMemo(() => {
    if (Object.keys(scores).length === 0 && uniqueBenefits.length > 0) {
      const initial: Record<string, number> = {};
      uniqueBenefits.forEach(b => initial[b] = 5); // Default a 5 (Aceptable)
      setScores(initial);
    }
  }, [uniqueBenefits]);

  const handleScoreChange = (benefit: string, value: number) => {
    setScores(prev => ({ ...prev, [benefit]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score <= 2) return "text-red-600 bg-red-50 border-red-200";
    if (score <= 4) return "text-orange-600 bg-orange-50 border-orange-200";
    if (score <= 7) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const getScoreLabel = (score: number) => {
    if (score === 0) return "No cuenta / Crítico";
    if (score <= 4) return "Deficiente";
    if (score <= 7) return "Aceptable";
    return "Óptimo";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      toast.error('Nombre y WhatsApp son obligatorios');
      return;
    }
    if (uniqueBenefits.length === 0) {
      toast.error('Primero debes configurar los planes de la agencia.');
      return;
    }

    const prospect: Prospect = {
      name,
      whatsapp,
      dateLimaISO: getCurrentDateLimaISO()
    };

    const result = calculateBestPlan(plans, scores);
    onResult(result, prospect);
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-zinc-100 rounded-[2rem] w-full"></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      
      {/* Datos del Prospecto */}
      <div className="glass rounded-[2rem] p-6 sm:p-8 border-zinc-200/60 shadow-sm">
        <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Datos del Prospecto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold">Nombre del Cliente / Clínica</Label>
            <Input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Dr. Juan Pérez"
              className="h-12 bg-white/60 focus-visible:ring-blue-600/20 text-lg rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold">WhatsApp de Contacto</Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-zinc-400" />
              <Input 
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+51 987 654 321"
                className="h-12 pl-11 bg-white/60 focus-visible:ring-blue-600/20 text-lg rounded-xl font-mono"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Evaluador */}
      <div className="glass rounded-[2rem] p-6 sm:p-8 border-zinc-200/60 shadow-sm relative">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-zinc-900">Evaluación de Capacidades</h3>
          <p className="text-zinc-500 font-medium">Califica del 0 al 10 el estado actual de cada área en el prospecto.</p>
        </div>

        {uniqueBenefits.length === 0 ? (
          <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-zinc-500 font-medium">No hay beneficios configurados. Registra planes primero.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {uniqueBenefits.map((benefit, idx) => {
              const score = scores[benefit] ?? 5;
              return (
                <div key={idx} className="bg-white/70 p-5 rounded-2xl border border-zinc-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-zinc-800 text-lg">{benefit}</span>
                    <div className={cn("px-3 py-1 rounded-lg border font-bold text-sm", getScoreColor(score))}>
                      {score} - {getScoreLabel(score)}
                    </div>
                  </div>
                  <div className="px-2">
                    <Slider 
                      value={[score]} 
                      max={10} 
                      step={1}
                      onValueChange={(val) => handleScoreChange(benefit, val[0])}
                      className="py-4 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">
                      <span>0 (Nada)</span>
                      <span>5 (Medio)</span>
                      <span>10 (Perfecto)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full h-16 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1"
      >
        Generar Diagnóstico y Plan Ideal
      </Button>

    </form>
  );
}