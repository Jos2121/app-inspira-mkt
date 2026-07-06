import { Button } from '@/components/ui/button';

interface NewOrderSummaryProps {
  total: number;
  onSubmit: () => void;
  isPending: boolean;
}

export function NewOrderSummary({ total, onSubmit, isPending }: NewOrderSummaryProps) {
  return (
    <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-xl shadow-zinc-950/10 sticky top-24">
      <h3 className="font-semibold text-lg mb-6 text-zinc-100">Resumen de Orden</h3>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal</span>
          <span className="font-mono">${total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Impuestos (0%)</span>
          <span className="font-mono">$0.00</span>
        </div>
        <div className="border-t border-zinc-800 my-4"></div>
        <div className="flex justify-between text-xl font-bold text-white">
          <span>Total</span>
          <span className="font-mono text-blue-400">${total.toLocaleString()}</span>
        </div>
      </div>
      
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1"
        onClick={onSubmit}
        disabled={isPending}
      >
        {isPending ? 'Procesando...' : 'Confirmar Orden'}
      </Button>
    </div>
  );
}
