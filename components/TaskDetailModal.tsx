"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Task, Priority } from "@/types";
import { X, Calendar, Clock, Tag, Hourglass, Bell, Copy, Trash2, Check, Save, Flag, CheckSquare, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const updateTask = useStore((state) => state.updateTask);
  const removeTask = useStore((state) => state.removeTask);
  const removeRoutineTasks = useStore((state) => state.removeRoutineTasks);
  const addTask = useStore((state) => state.addTask);
  const categories = useStore((state) => state.categories);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const taskDate = new Date(task.date);
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [priority, setPriority] = useState<Priority>(task.priority || "medium");
  const [date, setDate] = useState(format(taskDate, "yyyy-MM-dd"));
  const [time, setTime] = useState(format(taskDate, "HH:mm"));
  const [durationHours, setDurationHours] = useState(Math.floor((task.durationMinutes || 0) / 60));
  const [durationMinutes, setDurationMinutes] = useState((task.durationMinutes || 0) % 60);
  
  // Subtasks
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Focus Mode
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      // Optional: Play sound or notification
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(25 * 60);
  };
  
  // Helper to parse existing reminder
  const getInitialReminderValue = () => {
    if (!task.reminderTime) return "none";
    const taskTime = new Date(task.date).getTime();
    const reminderTime = new Date(task.reminderTime).getTime();
    const diff = taskTime - reminderTime;
    
    if (Math.abs(diff - 15 * 60000) < 1000) return "15m";
    if (Math.abs(diff - 60 * 60000) < 1000) return "1h";
    if (Math.abs(diff - 24 * 60 * 60000) < 1000) return "1d";
    return "none"; 
  };

  const [reminder, setReminder] = useState(getInitialReminderValue());

  const calculateReminder = (taskDateIso: string, type: string) => {
    const taskDate = new Date(taskDateIso);
    switch (type) {
      case "15m": return new Date(taskDate.getTime() - 15 * 60000).toISOString();
      case "1h": return new Date(taskDate.getTime() - 60 * 60000).toISOString();
      case "1d": return new Date(taskDate.getTime() - 24 * 60 * 60000).toISOString();
      default: return undefined;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const dateTimeString = time ? `${date}T${time}` : `${date}T09:00`;
    const dateTime = new Date(dateTimeString).toISOString();
    const totalDuration = durationHours * 60 + durationMinutes;

    updateTask(task.id, {
      title,
      category,
      priority,
      subtasks,
      date: dateTime,
      reminderTime: reminder === "none" ? undefined : calculateReminder(dateTime, reminder),
      durationMinutes: totalDuration > 0 ? totalDuration : undefined,
    });
    onClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteSingle = () => {
    removeTask(task.id);
    setIsDeleteModalOpen(false);
    onClose();
  };

  const handleConfirmDeleteRoutine = () => {
    if (task.routineId) {
      removeRoutineTasks(task.routineId);
    }
    setIsDeleteModalOpen(false);
    onClose();
  };

  const handleDuplicate = () => {
    addTask({
      ...task,
      id: crypto.randomUUID(),
      title: `${task.title} (Copy)`,
      isCompleted: false, 
      subtasks: task.subtasks?.map(s => ({ ...s, id: crypto.randomUUID(), isCompleted: false })) || []
    });
    onClose();
  };

  const addSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtaskTitle, isCompleted: false }]);
    setNewSubtaskTitle("");
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
             <h2 className="text-lg font-bold text-gray-800">Edit Task</h2>
             <button 
               onClick={() => setIsFocusMode(!isFocusMode)}
               className={cn("px-2 py-1 text-xs rounded-md font-medium border transition-colors flex items-center gap-1", isFocusMode ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-gray-50 text-gray-600 border-gray-200")}
             >
               <Hourglass className="w-3 h-3" /> Focus Mode
             </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isFocusMode ? (
          <div className="p-10 flex flex-col items-center justify-center space-y-6 bg-indigo-50/30 min-h-[300px]">
             <div className="text-center">
               <h3 className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-2">Focus Session</h3>
               <p className="text-4xl font-mono font-bold text-indigo-600">{formatTime(timeLeft)}</p>
             </div>
             
             <div className="flex gap-4">
               <button onClick={toggleTimer} className="p-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition transform hover:scale-105">
                 {isTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
               </button>
               <button onClick={resetTimer} className="p-4 rounded-full bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 shadow-sm transition">
                 <RotateCcw className="w-6 h-6" />
               </button>
             </div>
             
             <p className="text-xs text-gray-400 max-w-[200px] text-center">
               Stay focused on "{title}" for 25 minutes. Take a short break afterwards.
             </p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto">
            <form id="edit-task-form" onSubmit={handleSave} className="space-y-5">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-lg font-medium"
                  required
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium border transition-all truncate max-w-full",
                          category === cat.id ? cat.color + " ring-1 ring-offset-1 ring-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Priority
                  </label>
                  <div className="flex gap-1">
                    {(["low", "medium", "high"] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-xs font-medium border transition-all capitalize",
                          priority === p 
                            ? p === "high" ? "bg-red-100 text-red-700 border-red-200" 
                              : p === "medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" /> Subtasks
                </label>
                <div className="space-y-2 mb-2">
                   {subtasks.map(sub => (
                     <div key={sub.id} className="flex items-center gap-2 group">
                       <button
                         type="button" 
                         onClick={() => toggleSubtask(sub.id)}
                         className={cn(
                           "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                           sub.isCompleted ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 hover:border-indigo-400"
                         )}
                       >
                         {sub.isCompleted && <Check className="w-3 h-3" />}
                       </button>
                       <span className={cn("flex-1 text-sm", sub.isCompleted && "text-gray-400 line-through")}>{sub.title}</span>
                       <button type="button" onClick={() => deleteSubtask(sub.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                         <X className="w-3 h-3" />
                       </button>
                     </div>
                   ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a subtask..."
                    className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtask(e);
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={addSubtask}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={time.split(':')[0] || ''}
                      onChange={(e) => setTime(`${e.target.value}:${time.split(':')[1] || '00'}`)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Hour</option>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return <option key={hour} value={hour}>{hour}</option>;
                      })}
                    </select>
                    <select
                      value={time.split(':')[1] || ''}
                      onChange={(e) => setTime(`${time.split(':')[0] || '00'}:${e.target.value}`)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Min</option>
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Duration & Reminder */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Hourglass className="w-3 h-3" /> Duration
                  </label>
                  <select
                     value={durationHours * 60 + durationMinutes}
                     onChange={(e) => {
                       const total = parseInt(e.target.value);
                       setDurationHours(Math.floor(total / 60));
                       setDurationMinutes(total % 60);
                     }}
                     className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none cursor-pointer"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Bell className="w-3 h-3" /> Reminder
                  </label>
                  <select
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none cursor-pointer"
                  >
                    <option value="none">None</option>
                    <option value="15m">15 mins before</option>
                    <option value="1h">1 hour before</option>
                    <option value="1d">1 day before</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        {!isFocusMode && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center gap-3">
            <div className="flex gap-2">
               <button
                onClick={handleDeleteClick}
                className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-1 px-3 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition"
                title="Duplicate Task"
              >
                <Copy className="w-4 h-4" /> Duplicate
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        isRoutine={!!task.routineId}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmSingle={handleConfirmDeleteSingle}
        onConfirmRoutine={handleConfirmDeleteRoutine}
      />
    </div>
  );
}
