import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { format, isSameDay, startOfDay } from "date-fns";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { TaskDetailModal } from "./TaskDetailModal";

export function ListView() {
  const tasks = useStore((state) => state.tasks);
  const categories = useStore((state) => state.categories);
  const searchQuery = useStore((state) => state.searchQuery);
  const toggleTask = useStore((state) => state.toggleTask);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Group tasks by date
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const dateKey = format(new Date(task.date), "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  useEffect(() => {
    if (scrollRef.current) {
      const todayKey = format(new Date(), "yyyy-MM-dd");
      const todayElement = document.getElementById(`day-${todayKey}`);
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [tasks, searchQuery]); // Re-scroll if tasks or search query changes

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : "bg-gray-100 text-gray-700";
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <>
      <div ref={scrollRef} className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[600px] overflow-y-auto">
        {sortedDates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <p>No tasks found.</p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {sortedDates.map(dateKey => {
               const dateTasks = groupedTasks[dateKey];
               const dateObj = new Date(dateKey);
               const isToday = isSameDay(dateObj, new Date());
               
               return (
                 <div key={dateKey}>
                   <h3 id={`day-${dateKey}`} className={cn(
                     "text-sm font-bold uppercase tracking-wider mb-3 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10 border-b",
                     isToday ? "text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900" : "text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800"
                   )}>
                     {isToday ? "Today, " : ""}{format(dateObj, "EEEE, MMMM d")}
                   </h3>
                   <div className="space-y-2">
                     {dateTasks.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(task => (
                       <div 
                         key={task.id}
                         onDoubleClick={() => setEditingTask(task)}
                         className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all bg-white dark:bg-gray-800/50 group cursor-pointer"
                       >
                         <button 
                           onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                           className={cn("transition-colors", task.isCompleted ? "text-gray-400 dark:text-gray-600" : "text-indigo-600 dark:text-indigo-400")}
                         >
                           {task.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                         </button>
                         
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-0.5">
                             <span className={cn("font-medium truncate text-gray-800 dark:text-gray-200", task.isCompleted && "text-gray-400 dark:text-gray-600 line-through")}>
                               {task.title}
                             </span>
                             {getPriorityIcon(task.priority)}
                           </div>
                           <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(task.date), "HH:mm")}
                              </span>
                              <span className={cn("px-1.5 py-0.5 rounded", getCategoryColor(task.category))}>
                                {categories.find(c => c.id === task.category)?.label}
                              </span>
                              {task.subtasks && task.subtasks.length > 0 && (
                                <span className="text-gray-400 dark:text-gray-500">
                                  {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length} subtasks
                                </span>
                              )}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>

      {editingTask && (
        <TaskDetailModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
        />
      )}
    </>
  );
}
