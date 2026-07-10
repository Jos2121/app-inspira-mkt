import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ListChecks, Plus } from 'lucide-react';
import { useDiagnosticQuestions, useCreateDiagnosticQuestion, useDeleteDiagnosticQuestion } from '@/hooks/useDiagnostic';

export function DiagnosticChecklistConfig() {
  const [open, setOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  
  const { data: questions = [], isLoading } = useDiagnosticQuestions();
  const createQ = useCreateDiagnosticQuestion();
  const deleteQ = useDeleteDiagnosticQuestion();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    createQ.mutate(newQuestion.trim(), {
      onSuccess: () => setNewQuestion('')
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/50 border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-sm rounded-xl">
          <ListChecks className="w-4 h-4 mr-2" /> Configurar Checklist Base
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] max-h-[85vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Checklist de Auditoría</DialogTitle>
          <p className="text-sm text-zinc-500">Define los puntos clave que se evaluarán del 0 al 10 en cada diagnóstico.</p>
        </DialogHeader>
        
        <div className="pt-4 space-y-6">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input 
              value={newQuestion} 
              onChange={e => setNewQuestion(e.target.value)} 
              placeholder="Ej. ¿Cuentan con un CRM automatizado?" 
              className="bg-zinc-50"
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 shrink-0" disabled={createQ.isPending}>
              <Plus className="w-4 h-4" /> Agregar
            </Button>
          </form>

          <div className="space-y-2">
            {isLoading ? (
              <div className="animate-pulse space-y-2"><div className="h-12 bg-zinc-100 rounded-xl"></div></div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-center text-zinc-500 py-6 border border-dashed rounded-xl">El checklist está vacío.</p>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-xl shadow-sm group">
                  <span className="font-medium text-zinc-800 text-sm">{q.question}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteQ.mutate(q.id)} 
                    className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}