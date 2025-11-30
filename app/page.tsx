"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { CalendarView } from "@/components/CalendarView";
import { ListView } from "@/components/ListView";
import { KanbanView } from "@/components/KanbanView";
import { SmartReview } from "@/components/SmartReview";
import { useReminder } from "@/hooks/useReminder";
import { LayoutGrid, List, Kanban, Search, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "calendar" | "list" | "kanban";

export default function Home() {
  useReminder();
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const searchQuery = useStore((state) => state.searchQuery);
  const setSearchQuery = useStore((state) => state.setSearchQuery);
  
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check local storage or preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-full px-4 md:px-8 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My <span className="text-indigo-600 dark:text-indigo-400">Reminder</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
              Organize your day, simply.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm w-[200px] focus:w-[250px] transition-all focus:ring-2 focus:ring-indigo-500/20 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* View Switcher */}
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "calendar" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
                title="Calendar View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "kanban" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
                title="Kanban View"
              >
                <Kanban className="w-5 h-5" />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Smart Features */}
        <SmartReview />

        {/* Main Content */}
        <div className="w-full">
            {viewMode === "calendar" && <CalendarView />}
            {viewMode === "list" && <ListView />}
            {viewMode === "kanban" && <KanbanView />}
        </div>
      </div>
    </main>
  );
}