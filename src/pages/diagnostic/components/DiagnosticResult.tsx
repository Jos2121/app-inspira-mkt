import { DiagnosticResultType } from '@/hooks/useDiagnostic';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

interface DiagnosticResultProps {
  result: DiagnosticResultType;
  onReset: () => void;
}

export function DiagnosticResult({ result, onReset }: DiagnosticResultProps) {
  if (!result.recommendedPlan) {
    return (
      <div className="glass rounded-[2rem] p-8 text-center animate-in fade-in zoom-in-95 duration-700 fill-both border-amber-200/50 bg-amber-50/30">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">No requiere nuestros planes</h3>
        <p className="text-zinc-600 mb-6">
          Basado en las respuestas, el prospecto no presenta puntos de dolor críticos o no tenemos un plan que resuelva sus problemas actuales.
        </p>
        <button onClick={onReset} className="text-blue-600 font-semibold hover:underline">
          Nueva Evaluación
        </button>
      </div>
    );
  }

  const { recommendedPlan, matchPercentage, painPointsSolved, totalPainPoints } = result;

  return (
    <div className="glass rounded-[2.5rem] p-1 border-blue-200/60 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)] animate-in fade-in zoom-in-95 duration-700 fill-both relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 blur-3xl rounded-full -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>

      <div className="bg-white/60 backdrop-blur-md rounded-[2.25rem] p-8 sm:p-10 border border-white/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6">
            <TrendingUp className="w-4 h-4 mr-2" />
            Diagnóstico Completado
          </div>
          <h3 className="text-sm font-bold text-zinc-500 tracking-widest uppercase mb-2">Plan Recomendado</h3>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
            {recommendedPlan.name}
          </h2>
          <div className="inline-block bg-zinc-900 text-white px-6 py-2 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-500">
            <span className="text-3xl font-mono font-bold">{formatCurrency(recommendedPlan.price)}</span>
            <span className="text-zinc-400 ml-1 text-sm font-medium">/ mes</span>
          </div>
        </div>

        <div className="bg-white/80 rounded-3xl p-6 border border-zinc-100 shadow-sm mb-8">
          <div className="flex justify-between items-end mb-4">
            <h4 className="font-bold text-zinc-800 text-lg">Puntos de Dolor Resueltos</h4>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-600">{matchPercentage}%</span>
              <p className="text-xs font-semibold text-zinc-500 uppercase">Match Score</p>
            </div>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${matchPercentage}%` }}
            />
          </div>

          <p className="text-sm text-zinc-500 mb-3 font-medium">Este plan cubre {painPointsSolved.length} de {totalPainPoints} deficiencias clave detectadas:</p>
          <ul className="space-y-2.5">
            {painPointsSolved.map((pp, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-700 font-medium leading-tight">{pp}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={onReset}
          className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-4 rounded-2xl transition-colors"
        >
          Realizar otro diagnóstico
        </button>
      </div>
    </div>
  );
}