import { KpiCard } from '@/pages/dashboard/components/KpiCard';
import { Transaction } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface FinanceSummaryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function FinanceSummary({ transactions, isLoading }: FinanceSummaryProps) {
  const incomes = transactions
    .filter(t => t.type === 'Ingreso')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const expenses = transactions
    .filter(t => t.type === 'Gasto')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const balance = incomes - expenses;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <KpiCard
        title="Ingresos Totales"
        value={formatCurrency(incomes)}
        icon={TrendingUp}
        isLoading={isLoading}
        delay="100ms"
      />
      <KpiCard
        title="Gastos Totales"
        value={formatCurrency(expenses)}
        icon={TrendingDown}
        isLoading={isLoading}
        delay="200ms"
      />
      <KpiCard
        title="Balance / Utilidad"
        value={formatCurrency(balance)}
        icon={Wallet}
        isLoading={isLoading}
        delay="300ms"
      />
    </div>
  );
}