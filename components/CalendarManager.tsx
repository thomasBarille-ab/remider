"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { X, Calendar, Download, RefreshCw, Link2 } from "lucide-react";
import { parseICS } from "@/lib/calendarImporter";
import { cn } from "@/lib/utils";

interface CalendarManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDERS = [
  { id: "google", label: "Google Calendar", color: "bg-blue-100 text-blue-700", icon: "G" },
  { id: "outlook", label: "Outlook Calendar", color: "bg-cyan-100 text-cyan-700", icon: "O" },
  { id: "runna", label: "Runna", color: "bg-orange-100 text-orange-700", icon: "R" },
  { id: "other", label: "Other (iCal)", color: "bg-gray-100 text-gray-700", icon: "?" },
];

export function CalendarManager({ isOpen, onClose }: CalendarManagerProps) {
  const addTask = useStore((state) => state.addTask);
  const tasks = useStore((state) => state.tasks);
  const removeTask = useStore((state) => state.removeTask); // We might need a removeAllExternalTasks
  
  const [url, setUrl] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/calendar-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const { data } = await response.json();
      const newTasks = parseICS(data, selectedProvider.label);

      if (newTasks.length > 0) {
        // Option: Remove old tasks from this source before adding new ones?
        // For now, let's just append. In a real app, we'd want to sync properly.
        const existingIds = tasks.filter(t => t.source === selectedProvider.label).map(t => t.id);
        existingIds.forEach(id => removeTask(id));

        newTasks.forEach(task => addTask(task));
        setStatus("success");
        setUrl("");
      } else {
        setStatus("error"); // No events found
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Import Calendar
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Paste your iCal / ICS link from your favorite apps to see your events alongside your tasks.
          </p>

          {/* Provider Selection */}
          <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider)}
                className={cn(
                  "p-3 rounded-xl border flex items-center gap-3 transition-all",
                  selectedProvider.id === provider.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <span className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs", provider.color)}>
                  {provider.icon}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{provider.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Calendar URL (iCal)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://calendar.google.com/..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                required
              />
            </div>

            {status === "success" && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg">
                Calendar imported successfully!
              </div>
            )}
            {status === "error" && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">
                Failed to import. Check the URL and try again.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !url}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isLoading ? "Importing..." : "Import Events"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
