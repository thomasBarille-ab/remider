"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { TaskDetailModal } from "./TaskDetailModal";

export function CalendarView() {
  const tasks = useStore((state) => state.tasks);
  const categories = useStore((state) => state.categories);
  const toggleTask = useStore((state) => state.toggleTask);
  const updateTask = useStore((state) => state.updateTask);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : "bg-gray-100 text-gray-700";
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id === taskId);
    
    if (task) {
      // Preserve the original time, but change the date
      const originalDate = new Date(task.date);
      const newDate = new Date(targetDate);
      newDate.setHours(originalDate.getHours());
      newDate.setMinutes(originalDate.getMinutes());
      
      updateTask(taskId, { date: newDate.toISOString() });
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="py-2 text-center text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {calendarDays.map((day) => {
            const dayTasks = tasks.filter((task) => isSameDay(new Date(task.date), day));
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div
                key={day.toISOString()}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={cn(
                  "min-h-[80px] p-2 border-r border-b border-gray-100 transition hover:bg-gray-50 flex flex-col gap-1",
                  !isCurrentMonth && "bg-gray-50/50 text-gray-400"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isSameDay(day, new Date()) ? "bg-indigo-600 text-white" : "text-gray-700"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] no-scrollbar">
                  {dayTasks.map((task) => (
                    <button
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => toggleTask(task.id)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                      }}
                      className={cn(
                        "text-xs text-left px-2 py-1 rounded truncate flex items-center gap-1 group border cursor-grab active:cursor-grabbing",
                        task.isCompleted 
                          ? "bg-gray-100 text-gray-400 line-through border-transparent" 
                          : getCategoryColor(task.category)
                      )}
                      title={task.title}
                    >
                      {task.isCompleted ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{task.title}</span>
                      {task.durationMinutes && (
                        <span className="ml-1 text-gray-500 text-[10px] whitespace-nowrap">({Math.floor(task.durationMinutes / 60)}h {task.durationMinutes % 60}m)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
