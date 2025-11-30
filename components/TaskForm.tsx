"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Category, Priority } from "@/types";
import { Plus, Bell, Calendar, Clock, Tag, Hourglass, Settings2, Repeat, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryManager } from "./CategoryManager";
import { generateRoutineTasks, RecurrenceType } from "@/lib/routineLogic";

export function TaskForm() {
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);

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
    if (isExpanded && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isExpanded]);

  const resetForm = () => {
    setTitle("");
    setCategory(categories[0]?.id || "");
    setPriority("medium");
    setDate("");
    setTime("");
    setReminder("none");
    setDurationHours(0);
    setDurationMinutes(0);
    setIsExpanded(false);
    setIsRoutine(false);
    setRecurrenceType("daily");
    setIntervalDays(3);
    setSelectedWeekDays([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const dateTimeString = time ? `${date}T${time}` : `${date}T09:00`; 
    const dateTime = new Date(dateTimeString).toISOString();
    const totalDuration = durationHours * 60 + durationMinutes;

    const baseTask = {
      id: crypto.randomUUID(),
      title,
      category,
      priority,
      subtasks: [],
      date: dateTime,
      isCompleted: false,
      reminderTime: reminder === "none" ? undefined : calculateReminder(dateTime, reminder),
      durationMinutes: totalDuration > 0 ? totalDuration : undefined,
    };

    if (isRoutine) {
      const routineTasks = generateRoutineTasks(baseTask, {
        type: recurrenceType,
        intervalDays: recurrenceType === "interval" ? intervalDays : undefined,
        weekDays: recurrenceType === "weekly" ? selectedWeekDays : undefined,
      });
      routineTasks.forEach(task => addTask(task));
    } else {
      addTask(baseTask);
    }

    resetForm();
  };

  const calculateReminder = (taskDateIso: string, type: string) => {
    const taskDate = new Date(taskDateIso);
    switch (type) {
      case "15m": return new Date(taskDate.getTime() - 15 * 60000).toISOString();
      case "1h": return new Date(taskDate.getTime() - 60 * 60000).toISOString();
      case "1d": return new Date(taskDate.getTime() - 24 * 60 * 60000).toISOString();
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

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300">
        {!isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-center gap-2 py-3 text-lg font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add a task
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Add New Task</h2>
               </div>
               
               <button
                 type="button"
                 onClick={() => setIsRoutine(!isRoutine)}
                 className={cn(
                   "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                   isRoutine ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                 )}
               >
                 <Repeat className="w-4 h-4" />
                 {isRoutine ? "Routine Mode" : "One-time Task"}
               </button>
            </div>
            
            {/* Title Input */}
            <div className="relative">
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRoutine ? "What is the routine?" : "What needs to be done?"}
                className="w-full pl-4 pr-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-lg font-medium"
                required
              />
            </div>

            {/* Categories & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManagingCategories(true)}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
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
                        category === cat.id ? cat.color + " ring-2 ring-offset-1 ring-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
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

            {/* Routine Settings (Only visible if Routine Mode is on) */}
            {isRoutine && (
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
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
                        recurrenceType === type ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" : "text-gray-500 hover:bg-white/50"
                      )}
                    >
                      {type === "interval" ? "Custom Days" : type}
                    </button>
                  ))}
                </div>

                {recurrenceType === "interval" && (
                   <div className="flex items-center gap-2">
                     <span className="text-sm text-gray-600">Every</span>
                     <input 
                       type="number" 
                       min="2" 
                       value={intervalDays}
                       onChange={(e) => setIntervalDays(Math.max(2, parseInt(e.target.value) || 2))}
                       className="w-16 p-1.5 text-center rounded-lg border border-indigo-200 text-indigo-700 font-bold"
                     />
                     <span className="text-sm text-gray-600">days</span>
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
                          selectedWeekDays.includes(i) ? "bg-indigo-600 text-white" : "bg-white text-gray-400 border border-gray-200"
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {isRoutine ? "Start Date" : "Date"}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time
                </label>
                <div className="flex gap-2">
                  <select
                    value={time.split(':')[0] || ''}
                    onChange={(e) => setTime(`${e.target.value}:${time.split(':')[1] || '00'}`)}
                    className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none cursor-pointer"
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
                    className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none cursor-pointer"
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Hourglass className="w-3 h-3" /> Duration
                </label>
                <select
                   value={durationHours * 60 + durationMinutes}
                   onChange={(e) => {
                     const total = parseInt(e.target.value);
                     setDurationHours(Math.floor(total / 60));
                     setDurationMinutes(total % 60);
                   }}
                   className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none cursor-pointer"
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
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

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2.5 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-200 shadow-md shadow-indigo-200 hover:shadow-indigo-300"
              >
                Create Task
              </button>
            </div>
          </div>
        )}
      </form>

      {isManagingCategories && (
        <CategoryManager onClose={() => setIsManagingCategories(false)} />
      )}
    </>
  );
}

