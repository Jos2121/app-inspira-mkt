import { useState, useRef, useEffect } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { TaskFormModal } from './TaskFormModal';
import { toZonedTime } from 'date-fns-tz';
import { LIMA_TIMEZONE } from '@/lib/date-utils';

interface CalendarViewProps {
  tasks: Task[];
  onTaskCreate: (data: any) => void;
  onTaskUpdate: (id: string, data: any) => void;
  onTaskDelete: (id: string) => void;
  isPending: boolean;
  isDeleting: boolean;
}

export function CalendarView({ tasks, onTaskCreate, onTaskUpdate, onTaskDelete, isPending, isDeleting }: CalendarViewProps) {
  
  const getLimaToday = () => toZonedTime(new Date(), LIMA_TIMEZONE);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState(getLimaToday());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-scroll a las 7:00 AM (420 pixeles)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * 60;
    }
  }, []);

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const today = () => setCurrentDate(getLimaToday());

  const targetDateStr = format(currentDate, 'yyyy-MM-dd');
  const limaToday = getLimaToday();
  const isCurrentDay = isSameDay(currentDate, limaToday);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pendiente': return 'bg-amber-100/95 text-amber-900 border-amber-300';
      case 'En Proceso': return 'bg-blue-100/95 text-blue-900 border-blue-300';
      case 'Completada': return 'bg-emerald-100/95 text-emerald-900 border-emerald-300';
      default: return 'bg-zinc-100/95 text-zinc-900 border-zinc-300';
    }
  };

  const handleHourClick = (hour: number) => {
    const newDate = new Date(currentDate);
    newDate.setHours(hour, 0, 0, 0);
    setSelectedDate(newDate);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedTask) {
      onTaskUpdate(selectedTask.id, data);
    } else {
      onTaskCreate(data);
    }
    setIsModalOpen(false);
  };

  // Helper para extraer los minutos desde las 00:00 del string original
  const getMinutesFromMidnight = (dateString: string) => {
    const normalized = dateString.replace(' ', 'T');
    const [datePart, timePart] = normalized.split('T');
    
    if (datePart < targetDateStr) return 0; // Inició antes de hoy
    if (datePart > targetDateStr) return 24 * 60; // Termina después de hoy
    
    const [h, m] = (timePart || "00:00").split(':').map(Number);
    return h * 60 + (m || 0);
  };

  // Filtrar las tareas que caen en el día seleccionado
  const dayTasks = tasks.filter(t => {
    const startNorm = t.startTime.replace(' ', 'T').split('T')[0];
    const endNorm = t.endTime.replace(' ', 'T').split('T')[0];
    return startNorm <= targetDateStr && endNorm >= targetDateStr;
  });

  // Calcular las posiciones y superposiciones
  const processedTasks = dayTasks.sort((a, b) => {
    return getMinutesFromMidnight(a.startTime) - getMinutesFromMidnight(b.startTime);
  }).map((task, index, array) => {
    const startMins = getMinutesFromMidnight(task.startTime);
    const endMins = getMinutesFromMidnight(task.endTime);
    
    // Contar tareas anteriores con las que se cruza (para visualización en cascada)
    let overlapIndex = 0;
    for (let i = 0; i < index; i++) {
      if (array[i].endMins > startMins) {
        overlapIndex++;
      }
    }
    overlapIndex = Math.min(overlapIndex, 4); // Límite máximo de cascada
    
    return { ...task, startMins, endMins, overlapIndex };
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="glass rounded-[2rem] border-zinc-200/60 shadow-sm overflow-hidden flex flex-col h-[750px]">
      
      {/* Cabecera y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white/50 gap-4">
        <h2 className="text-xl font-bold text-zinc-800 capitalize whitespace-nowrap">
          {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
        </h2>
        
        <div className="flex flex-wrap items-center gap-2 justify-center w-full sm:w-auto">
          <Input
            type="date"
            value={targetDateStr}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split('-').map(Number);
                setCurrentDate(new Date(y, m - 1, d));
              }
            }}
            className="w-[140px] h-9 bg-white cursor-pointer focus-visible:ring-blue-600/20"
          />
          
          <div className="flex items-center bg-zinc-100/50 rounded-xl p-1 border border-zinc-200/50">
            <Button variant="ghost" size="icon" className="h-7 w-8 rounded-lg" onClick={prevDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs font-semibold px-3" onClick={today}>
              Hoy
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-8 rounded-lg" onClick={nextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 ml-2" onClick={() => { setSelectedDate(undefined); setSelectedTask(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> Tarea
          </Button>
        </div>
      </div>

      {/* Área de la línea de tiempo */}
      <div className="flex-1 overflow-y-auto bg-zinc-50/30 no-scrollbar relative" ref={scrollRef}>
        <div className="relative" style={{ height: 1440 }}> {/* 24 horas x 60px */}
          
          {/* Líneas de las horas */}
          {hours.map(h => (
            <div key={h} className="absolute w-full flex border-b border-zinc-100/80" style={{ top: h * 60, height: 60 }}>
              <div className="w-20 text-xs font-bold text-zinc-400 text-right pr-3 pt-1.5 bg-white/50 border-r border-zinc-100">
                {h.toString().padStart(2, '0')}:00
              </div>
              <div 
                className="flex-1 cursor-pointer hover:bg-blue-50/40 transition-colors"
                onClick={() => handleHourClick(h)}
              ></div>
            </div>
          ))}

          {/* Indicador de Hora Actual */}
          {isCurrentDay && (
            <div 
              className="absolute left-20 right-0 border-t-[2px] border-red-500 z-20 pointer-events-none" 
              style={{ top: limaToday.getHours() * 60 + limaToday.getMinutes() }}
            >
              <div className="absolute -left-1.5 -top-[5px] w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            </div>
          )}

          {/* Tareas */}
          <div className="absolute left-20 right-0 top-0 bottom-0 pointer-events-none">
            {processedTasks.map(task => {
              const top = task.startMins;
              const height = Math.max(task.endMins - task.startMins, 25); // Mínimo 25px para que se pueda hacer clic
              
              const startDisplay = task.startTime.replace(' ', 'T').split('T')[1]?.substring(0, 5);
              const endDisplay = task.endTime.replace(' ', 'T').split('T')[1]?.substring(0, 5);

              return (
                <div
                  key={task.id}
                  onClick={(e) => handleTaskClick(e, task)}
                  className={cn(
                    "absolute rounded-lg p-2 border shadow-sm cursor-pointer pointer-events-auto transition-transform hover:scale-[1.01]",
                    getStatusColor(task.status)
                  )}
                  style={{ 
                    top, 
                    height, 
                    left: 8 + (task.overlapIndex * 24), 
                    right: 12,
                    zIndex: 10 + task.overlapIndex
                  }}
                >
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="text-xs font-bold truncate leading-tight">{task.title}</div>
                    
                    {height >= 45 && (
                      <>
                        <div className="text-[10px] font-mono font-semibold opacity-70 mt-1">
                          {startDisplay} - {endDisplay}
                        </div>
                        {task.description && (
                          <div className="text-[10px] truncate opacity-80 mt-0.5 leading-tight">
                            {task.description}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
        </div>
      </div>

      <TaskFormModal 
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={onTaskDelete}
        isPending={isPending}
        isDeleting={isDeleting}
        selectedDate={selectedDate}
      />
    </div>
  );
}