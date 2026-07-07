import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { Transaction } from '@/hooks/useFinance';
import { cn, formatCurrency } from '@/lib/utils';
import { formatLocalDateString } from '@/lib/date-utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function TransactionList({ transactions, isLoading, onDelete, isDeleting }: TransactionListProps) {
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (txToDelete) {
      onDelete(txToDelete);
      setTxToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría / Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right w-16">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">Cargando movimientos...</TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">No se encontraron movimientos financieros</TableCell></TableRow>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === 'Ingreso';
                
                return (
                  <TableRow key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                    <TableCell className="font-medium text-zinc-700 capitalize">
                      {formatLocalDateString(tx.date, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900">{tx.category}</span>
                        {tx.description && <span className="text-xs text-zinc-500">{tx.description}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "font-medium border-transparent", 
                        isIncome ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      )}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono font-bold", isIncome ? "text-emerald-600" : "text-red-600")}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setTxToDelete(tx.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!txToDelete} onOpenChange={(open) => !open && setTxToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se descontará del balance general de forma inmediata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}