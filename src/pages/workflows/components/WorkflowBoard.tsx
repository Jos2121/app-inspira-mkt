import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Workflow, useCreateTask, useDeleteTask, useReorderTasks, useCreateColumn } from '@/hooks/useWorkflows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, GripVertical, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowBoardProps {
  workflow: Workflow;
}

export function WorkflowBoard({ workflow }: WorkflowBoardProps) {
  // Estado local para actualizaciones optimistas ultrarrápidas
  const [columns, setColumns] = useState(workflow.columns);
  const [newTaskContent, setNewTaskContent] = useState<Record<string, string>>({});
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState('');

  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();
  const createCol = useCreateColumn();

  // Sincronizar estado local si el server manda nuevos datos y no estamos haciendo drag
  useEffect(() => {
    setColumns(workflow.columns);
  }, [workflow.columns]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColIndex = columns.findIndex(c => c.id === source.droppableId);
    const destColIndex = columns.findIndex(c => c.id === destination.droppableId);
    
    if (sourceColIndex === -1 || destColIndex === -1) return;

    const newCols = [...columns];
    const sourceCol = newCols[sourceColIndex];
    const destCol = newCols[destColIndex];

    const sourceTasks = [...sourceCol.tasks];
    const destTasks = source.droppableId === destination.droppableId ? sourceTasks : [...destCol.tasks];

    // Remover de fuente
    const [movedTask] = sourceTasks.splice(source.index, 1);
    
    // Insertar en destino
    destTasks.splice(destination.index, 0, movedTask);

    // Actualizar columnas en estado local
    newCols[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
    if (source.droppableId !== destination.droppableId) {
      newCols[destColIndex] = { ...destCol, tasks: destTasks };
    }

    setColumns(newCols);

    // Preparar payload para la API (Batch Update)
    const updatesToPush: { id: string; columnId: string; orderIndex: number }[] = [];
    
    // Recalcular índices del destino
    destTasks.forEach((task, index) => {
      updatesToPush.push({ id: task.id, columnId: destination.droppableId, orderIndex: index });
    });

    // Si se movió entre columnas diferentes, también actualizamos índices de la fuente
    if (source.droppableId !== destination.droppableId) {
      sourceTasks.forEach((task, index) => {
        updatesToPush.push({ id: task.id, columnId: source.droppableId, orderIndex: index });
      });
    }

    reorderTasks.mutate(updatesToPush);
  };

  const handleAddTask = (columnId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = newTaskContent[columnId];
    if (!content?.trim()) return;

    const col = columns.find(c => c.id === columnId);
    const orderIndex = col ? col.tasks.length : 0;

    createTask.mutate({ columnId, content, orderIndex }, {
      onSuccess: () => setNewTaskContent({ ...newTaskContent, [columnId]: '' })
    });
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    
    createCol.mutate({ workflowId: workflow.id, title: newColName, orderIndex: columns.length }, {
      onSuccess: () => {
        setAddingCol(false);
        setNewColName('');
      }
    });
  };

  return (
    <div className="flex h-full w-full overflow-x-auto pb-4 no-scrollbar items-start space-x-6">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80 bg-zinc-100/80 rounded-[1.5rem] flex flex-col max-h-full border border-zinc-200/50 shadow-sm overflow-hidden">
            
            {/* Header Columna */}
            <div className="p-4 border-b border-zinc-200/50 bg-white/50 backdrop-blur-sm flex justify-between items-center shrink-0">
              <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                {column.title}
              </h3>
              <span className="text-xs font-bold bg-zinc-200 text-zinc-600 px-2 py-1 rounded-md">
                {column.tasks.length}
              </span>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className={cn(
                    "flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px] transition-colors duration-200",
                    snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                  )}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "bg-white p-3.5 rounded-xl border shadow-sm group relative",
                            snapshot.isDragging ? "shadow-xl border-blue-300 ring-2 ring-blue-500/20 rotate-2 z-50" : "border-zinc-200 hover:border-blue-200 hover:shadow-md transition-all"
                          )}
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all z-10"
                            onClick={() => deleteTask.mutate(task.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <div className="flex gap-2">
                            <GripVertical className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-zinc-700 leading-snug pr-4">
                              {task.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Footer / Input Columna */}
            <div className="p-3 bg-white/40 border-t border-zinc-200/50 shrink-0">
              <form onSubmit={(e) => handleAddTask(column.id, e)} className="flex gap-2">
                <Input 
                  placeholder="Añadir función..." 
                  className="h-9 bg-white text-sm focus-visible:ring-blue-600/20"
                  value={newTaskContent[column.id] || ''}
                  onChange={e => setNewTaskContent({ ...newTaskContent, [column.id]: e.target.value })}
                />
                <Button type="submit" size="icon" className="h-9 w-9 shrink-0 bg-zinc-800 hover:bg-zinc-900" disabled={createTask.isPending}>
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            </div>

          </div>
        ))}
      </DragDropContext>

      {/* Agregar nueva columna */}
      <div className="flex-shrink-0 w-80">
        {!addingCol ? (
          <Button 
            variant="outline" 
            className="w-full h-14 bg-white/50 border-dashed border-2 border-zinc-300 text-zinc-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-[1.5rem] transition-all"
            onClick={() => setAddingCol(true)}
          >
            <Plus className="w-5 h-5 mr-2" /> Añadir Rol / Columna
          </Button>
        ) : (
          <div className="bg-white p-4 rounded-[1.5rem] border border-zinc-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleAddColumn} className="space-y-3">
              <Input 
                autoFocus
                placeholder="Nombre del rol o área..." 
                className="h-10"
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={createCol.isPending}>
                  Guardar
                </Button>
                <Button type="button" variant="ghost" onClick={() => setAddingCol(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}