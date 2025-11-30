"use client";

import { useStore } from "@/store/useStore";
import { Task, Priority } from "@/types";
import { useState } from "react";
import { TaskDetailModal } from "./TaskDetailModal";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, MoreHorizontal, Plus } from "lucide-react";

export function KanbanView() {
  const tasks = useStore((state) => state.tasks);
  const categories = useStore((state) => state.categories);
  const searchQuery = useStore((state) => state.searchQuery);
  const toggleTask = useStore((state) => state.toggleTask);
  const updateTask = useStore((state) => state.updateTask);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const priorityColumns: { id: Priority; label: string; color: string }[] = [
    { id: "high", label: "High Priority", color: "bg-red-50 text-red-700 border-red-100" },
    { id: "medium", label: "Medium Priority", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    { id: "low", label: "Low Priority", color: "bg-blue-50 text-blue-700 border-blue-100" },
  ];

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

  const handleDrop = (e: React.DragEvent, priority: Priority) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      updateTask(taskId, { priority });
    }
  };

  return (
    <>
      <div className="flex gap-4 h-[600px] overflow-x-auto pb-2">
        {priorityColumns.map((col) => {
          const colTasks = tasks
            .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(t => (t.priority || 'medium') === col.id && !t.isCompleted);
          
          return (
            <div 
              key={col.id} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex-1 min-w-[300px] bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-full transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            >
               <div className={cn("p-3 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-t-xl z-10", col.color)}>
                 <h3 className="font-bold text-sm uppercase tracking-wide">{col.label}</h3>
                 <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded text-xs font-bold">{colTasks.length}</span>
               </div>
               
               <div className="p-3 space-y-3 overflow-y-auto flex-1">
                 {colTasks.map(task => (
                   <div 
                     key={task.id}
                     draggable
                     onDragStart={(e) => handleDragStart(e, task.id)}
                     onDoubleClick={() => setEditingTask(task)}
                     className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                   >
                     <div className="flex items-start justify-between mb-2">
                       <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", getCategoryColor(task.category))}>
                         {categories.find(c => c.id === task.category)?.label}
                       </span>
                       <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} className="text-gray-300 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                         <Circle className="w-4 h-4" />
                       </button>
                     </div>
                     
                     <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{task.title}</h4>
                     
                     {task.subtasks && task.subtasks.length > 0 && (
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2 mb-1">
                          <div 
                            className="bg-indigo-500 h-1.5 rounded-full transition-all" 
                            style={{ width: `${(task.subtasks.filter(s => s.isCompleted).length / task.subtasks.length) * 100}%` }} 
                          />
                        </div>
                     )}
                   </div>
                 ))}
                 
                 {colTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                      No tasks
                    </div>
                 )}
               </div>
            </div>
          );
        })}
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
