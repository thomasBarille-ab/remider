"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Task } from "@/types";
import { X, Calendar, Clock, Tag, Hourglass, Bell, Copy, Trash2, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const updateTask = useStore((state) => state.updateTask);
  const removeTask = useStore((state) => state.removeTask);
  const addTask = useStore((state) => state.addTask);
  const categories = useStore((state) => state.categories);

  const taskDate = new Date(task.date);
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [date, setDate] = useState(format(taskDate, "yyyy-MM-dd"));
  const [time, setTime] = useState(format(taskDate, "HH:mm"));
  const [durationHours, setDurationHours] = useState(Math.floor((task.durationMinutes || 0) / 60));
  const [durationMinutes, setDurationMinutes] = useState((task.durationMinutes || 0) % 60);
  
  // Helper to parse existing reminder to simple values (15m, 1h, 1d) for the select
  // This is a simplification as the original stored value is a specific ISO date
  const getInitialReminderValue = () => {
    if (!task.reminderTime) return "none";
    const taskTime = new Date(task.date).getTime();
    const reminderTime = new Date(task.reminderTime).getTime();
    const diff = taskTime - reminderTime;
    
    if (Math.abs(diff - 15 * 60000) < 1000) return "15m";
    if (Math.abs(diff - 60 * 60000) < 1000) return "1h";
    if (Math.abs(diff - 24 * 60 * 60000) < 1000) return "1d";
    return "none"; // Custom or other values default to none/unchanged in UI for now
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
    // Ensure we keep the ISO format correct
    const dateTime = new Date(dateTimeString).toISOString();
    const totalDuration = durationHours * 60 + durationMinutes;

    updateTask(task.id, {
      title,
      category,
      date: dateTime,
      reminderTime: reminder === "none" ? undefined : calculateReminder(dateTime, reminder),
      durationMinutes: totalDuration > 0 ? totalDuration : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      removeTask(task.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    addTask({
      ...task,
      id: crypto.randomUUID(),
      title: `${task.title} (Copy)`,
      isCompleted: false, // Reset completion status for copy
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Edit Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

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

            {/* Category */}
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
                      "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                      category === cat.id ? cat.color + " ring-2 ring-offset-1 ring-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
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

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center gap-3">
          <div className="flex gap-2">
             <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1 px-3 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium transition"
              title="Duplicate Task"
            >
              <Copy className="w-4 h-4" /> Duplicate
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
