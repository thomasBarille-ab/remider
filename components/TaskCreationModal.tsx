"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Category, Priority, Task } from "@/types";
import { Plus, Bell, Calendar, Clock, Tag, Hourglass, Settings2, Repeat, Flag, X, Save, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryManager } from "./CategoryManager";
import { generateRoutineTasks, RecurrenceType } from "@/lib/routineLogic";
import { fr, en } from 'chrono-node';
import { format } from "date-fns";

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskCreationModal({ isOpen, onClose }: TaskCreationModalProps) {
  const addTask = useStore((state) => state.addTask);
  const categories = useStore((state) => state.categories);
  
  // Set default category to the first one available or fallback if empty
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(categories[0]?.id || "");
  const [priority, setPriority] = useState<Priority>("medium");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState("none");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  // NLP Input
  const [nlpInput, setNlpInput] = useState("");

  // Routine State
  const [isRoutine, setIsRoutine] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("daily");
  const [intervalDays, setIntervalDays] = useState(3);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If current selected category doesn't exist anymore (deleted), select the first one
    if (categories.length > 0 && !categories.find(c => c.id === category)) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setCategory(categories[0]?.id || "");
    setPriority("medium");
    setDate("");
    setTime("");
    setReminder("none");
    setDurationHours(0);
    setDurationMinutes(0);
    setIsRoutine(false);
    setRecurrenceType("daily");
    setIntervalDays(3);
    setSelectedWeekDays([]);
    setNlpInput("");
  };

  const handleNlpParse = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && nlpInput.trim()) {
      e.preventDefault();
      
      // Try French first, then English
      let parsed = fr.parse(nlpInput, new Date(), { forwardDate: true });
      if (parsed.length === 0) {
        parsed = en.parse(nlpInput, new Date(), { forwardDate: true });
      }
      
      if (parsed.length > 0) {
        const result = parsed[0];
        const parsedDate = result.start.date();
        
        // Extract title: remove the parsed date text from the input
        let newTitle = nlpInput.replace(result.text, "").trim();
        // Remove common prepositions/connectors that might remain dangling (e.g. "Meeting at", "Réunion le")
        newTitle = newTitle.replace(/\s+(at|on|le|à|pour)$/i, "").trim();
        
        // Fallback if title becomes empty
        if (!newTitle) newTitle = nlpInput;

        setTitle(newTitle);
        setDate(format(parsedDate, "yyyy-MM-dd"));
        
        // Check if time was implied (not just date)
        if (result.start.isCertain('hour')) {
           setTime(format(parsedDate, "HH:mm"));
        } else {
           setTime("");
        }
      } else {
        // Fallback: Just use the text as title
        setTitle(nlpInput);
      }
      setNlpInput(""); // Clear magic input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const dateTimeString = time ? `${date}T${time}` : `${date}T09:00`; 
    const dateTime = new Date(dateTimeString);
    const totalDuration = durationHours * 60 + durationMinutes;

    const baseTask = {
      title,
      category,
      priority,
      subtasks: [],
      date: dateTime, // dateTime is already an ISO string here
      isCompleted: false,
      reminderTime: reminder === "none" ? undefined : calculateReminder(dateTime, reminder), // calculateReminder returns Date | undefined, needs to be ISO string
      durationMinutes: totalDuration > 0 ? totalDuration : undefined,
    };

    if (isRoutine) {
      const routineTasks = generateRoutineTasks(baseTask, {
        type: recurrenceType,
        intervalDays: recurrenceType === "interval" ? intervalDays : undefined,
        weekDays: recurrenceType === "weekly" ? selectedWeekDays : undefined,
      });
      // Add tasks one by one asynchronously
      for (const task of routineTasks) {
        await addTask(task);
      }
    } else {
      await addTask(baseTask);
    }

    resetForm();
    onClose();
  };

  const calculateReminder = (taskDate: Date, type: string): Date | undefined => {
    switch (type) {
      case "15m": return new Date(taskDate.getTime() - 15 * 60000);
      case "1h": return new Date(taskDate.getTime() - 60 * 60000);
      case "1d": return new Date(taskDate.getTime() - 24 * 60 * 60000);
      default: return undefined;
    }
  };

  const toggleWeekDay = (dayIndex: number) => {
    setSelectedWeekDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
        <div 
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
             <div className="flex items-center gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Add New Task</h2>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
               <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
             </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form id="create-task-form" onSubmit={handleSubmit} className="space-y-5">
              
              {/* Magic Input (NLP) */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <input
                  type="text"
                  value={nlpInput}
                  onChange={(e) => setNlpInput(e.target.value)}
                  onKeyDown={handleNlpParse}
                  placeholder="Magic add: 'Réunion demain à 14h' (Entrée)"
                  className="w-full bg-transparent border-none text-sm focus:ring-0 placeholder-indigo-300 dark:placeholder-indigo-500/50 text-indigo-900 dark:text-indigo-200"
                />
              </div>

              <div className="flex justify-end">
                 <button
                   type="button"
                   onClick={() => setIsRoutine(!isRoutine)}
                   className={cn(
                     "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                     isRoutine ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-800" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                   )}
                 >
                   <Repeat className="w-4 h-4" />
                   {isRoutine ? "Routine Mode" : "One-time Task"}
                 </button>
              </div>

              {/* Title Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isRoutine ? "What is the routine?" : "What needs to be done?"}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all text-lg font-medium"
                  required
                />
              </div>

              {/* Categories & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsManagingCategories(true)}
                      className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                    >
                      <Settings2 className="w-3 h-3" /> Manage
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                          category === cat.id ? cat.color + " ring-2 ring-offset-1 ring-indigo-200 dark:ring-indigo-800" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Priority
                  </label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize",
                          priority === p 
                            ? p === "high" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" 
                              : p === "medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Routine Settings (Only visible if Routine Mode is on) */}
              {isRoutine && (
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 space-y-3">
                  <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Repeat className="w-3 h-3" /> Frequency
                  </label>
                  <div className="flex gap-2">
                    {(["daily", "weekly", "interval"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRecurrenceType(type)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium transition capitalize",
                          recurrenceType === type ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800" : "text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                        )}
                      >
                        {type === "interval" ? "Custom Days" : type}
                      </button>
                    ))}
                  </div>

                  {recurrenceType === "interval" && (
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-600 dark:text-gray-400">Every</span>
                       <input 
                         type="number" 
                         min="2" 
                         value={intervalDays}
                         onChange={(e) => setIntervalDays(Math.max(2, parseInt(e.target.value) || 2))}
                         className="w-16 p-1.5 text-center rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 font-bold"
                       />
                       <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                     </div>
                  )}

                  {recurrenceType === "weekly" && (
                    <div className="flex justify-between">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleWeekDay(i)}
                          className={cn(
                            "w-8 h-8 rounded-full text-xs font-bold transition flex items-center justify-center",
                            selectedWeekDays.includes(i) ? "bg-indigo-600 dark:bg-indigo-500 text-white" : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {isRoutine ? "Start Date" : "Date"}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none text-sm text-gray-800 dark:text-gray-200"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={time.split(':')[0] || ''}
                      onChange={(e) => setTime(`${e.target.value}:${time.split(':')[1] || '00'}`)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none text-sm appearance-none cursor-pointer text-gray-800 dark:text-gray-200"
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
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none text-sm appearance-none cursor-pointer text-gray-800 dark:text-gray-200"
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

              {/* Duration & Reminder Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Hourglass className="w-3 h-3" /> Duration
                  </label>
                  <select
                     value={durationHours * 60 + durationMinutes}
                     onChange={(e) => {
                       const total = parseInt(e.target.value);
                       setDurationHours(Math.floor(total / 60));
                       setDurationMinutes(total % 60);
                     }}
                     className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none text-sm appearance-none cursor-pointer text-gray-800 dark:text-gray-200"
                  >
                    <option value="0">Select duration...</option>
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Bell className="w-3 h-3" /> Reminder
                  </label>
                  <select
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none cursor-pointer"
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

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-task-form"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Create Task
            </button>
          </div>
        </div>
      </div>

      {isManagingCategories && (
        <CategoryManager onClose={() => setIsManagingCategories(false)} />
      )}
    </>
  );
}
