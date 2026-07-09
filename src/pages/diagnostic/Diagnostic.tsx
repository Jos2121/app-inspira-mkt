import { useState } from 'react';
import { DiagnosticPlans } from './components/DiagnosticPlans';
import { ProspectScorer } from './components/ProspectScorer';
import { DiagnosticResult } from './components/DiagnosticResult';
import { DiagnosticResultType, Prospect } from '@/hooks/useDiagnostic';
import { Activity } from 'lucide-react';

export default function Diagnostic() {
  const [result, setResult] = useState<{ calc: DiagnosticResultType, prospect: Prospect } | null>(null);

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Diagnosticador
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            Evalúa las deficiencias de tus prospectos y sugiere el mejor plan de agencia automáticamente.
          </p>
        </div>
        {!result && <DiagnosticPlans />}
      </div>

      <div className="animate-in fade-in duration-1000 delay-100 fill-both">
        {result ? (
          <DiagnosticResult result={result.calc} onReset={handleReset} />
        ) : (
          <ProspectScorer onResult={(calc, prospect) => setResult({ calc, prospect })} />
        )}
      </div>
    </div>
  );
}