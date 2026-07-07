import { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  isSameMonth, isSameDay, eachDayOfInterval 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const [currentDate, setCurrentDate] = useState(getLimaToday());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(getLimaToday());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pendiente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'En Proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completada': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
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

  const limaToday = getLimaToday();

  return (
    <div className="glass rounded-[2rem] border-zinc-200/60 shadow-sm overflow-hidden flex flex-col h-[750px]">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-zinc-800 capitalize">
            {format(currentDate, dateFormat, { locale: es })}
          </h2>
          <div className="flex items-center bg-zinc-100/50 rounded-xl p-1 border border-zinc-200/50">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-semibold px-3" onClick={today}>Hoy</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" onClick={() => { setSelectedDate(undefined); setSelectedTask(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Tarea
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col bg-zinc-50/30 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-zinc-100 bg-white/50">
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-xs font-bold text-zinc-500 tracking-wider">{day}</div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isSameDay(day, limaToday);
            
            const dayTasks = tasks.filter(t => t.startTime.startsWith(format(day, 'yyyy-MM-dd')));

            return (
              <div 
                key={day.toString()} 
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[100px] border-b border-r border-zinc-100/80 p-1.5 transition-colors hover:bg-blue-50/50 cursor-pointer flex flex-col gap-1",
                  !isCurrentMonth && "bg-zinc-50/50 text-zinc-400 opacity-60",
                  (i + 1) % 7 === 0 && "border-r-0"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                    isTodayDate ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-zinc-600"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                {/* Tasks container */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                  {dayTasks.map(task => {
                    // Extracción robusta de la hora, normalizando espacios a 'T'
                    const parts = task.startTime.replace(' ', 'T').split('T');
                    const timeString = parts.length > 1 ? parts[1].substring(0, 5) : '';
                    
                    return (
                      <div 
                        key={task.id}
                        onClick={(e) => handleTaskClick(e, task)}
                        className={cn(
                          "text-[10px] px-1.5 py-1 rounded-md font-medium border truncate transition-transform hover:scale-[1.02]",
                          getStatusColor(task.status)
                        )}
                        title={`${task.title} - ${timeString}`}
                      >
                        {timeString && <span className="font-bold mr-1 opacity-70">{timeString}</span>}
                        {task.title}
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
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