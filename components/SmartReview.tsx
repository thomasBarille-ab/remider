"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { generateSuggestions } from "@/lib/smartScheduler";
import { Sparkles, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Statistics } from "./Statistics";
import { BarChart3 } from "lucide-react";

export function SmartReview() {
  const { tasks, suggestions, categories, setSuggestions, acceptSuggestion, rejectSuggestion } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Simulate "Sunday Night" check or just allow manual trigger
  const checkForSuggestions = () => {
    const newSuggestions = generateSuggestions(tasks);
    if (newSuggestions.length > 0) {
      setSuggestions(newSuggestions);
      setIsOpen(true);
    } else {
      alert("No patterns found yet to generate suggestions based on your history.");
    }
  };

  const hasSuggestions = suggestions.length > 0;

  const getCategoryLabel = (id: string) => categories.find(c => c.id === id)?.label || id;

  return (
    <>
      <div className="flex gap-4">
        {/* Smart Planner Card */}
        <div className="flex-1 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900">Smart Planner</h3>
              <p className="text-sm text-indigo-700">Plan your upcoming week based on your habits.</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (hasSuggestions) setIsOpen(true);
              else checkForSuggestions();
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            {hasSuggestions ? `Review ${suggestions.length} Suggestions` : "Generate Plan"}
          </button>
        </div>

        {/* Stats Button */}
        <button
          onClick={() => setIsStatsOpen(true)}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 rounded-xl flex flex-col items-center justify-center gap-1 min-w-[100px] transition shadow-sm"
        >
          <BarChart3 className="w-5 h-5 text-gray-500" />
          <span className="text-xs font-semibold">Statistics</span>
        </button>
      </div>

      {/* Statistics Modal */}
      {isStatsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setIsStatsOpen(false)}>
           <div 
             className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  Your Statistics
                </h2>
                <button onClick={() => setIsStatsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-gray-50/50">
                 <Statistics />
              </div>
           </div>
        </div>
      )}

      {isOpen && hasSuggestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           {/* ... (Modal content) ... */}
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Weekly Suggestions</h2>
                <p className="text-sm text-gray-500">Review and confirm tasks for the upcoming week.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-100 transition bg-white shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
                      <p className="text-xs text-gray-500 flex gap-2">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{getCategoryLabel(suggestion.category)}</span>
                        <span>{format(new Date(suggestion.suggestedDate), "EEE, MMM d • h:mm a")}</span>
                        {suggestion.durationMinutes && (
                          <span className="ml-1 text-gray-500 text-[10px] whitespace-nowrap">({Math.floor(suggestion.durationMinutes / 60)}h {suggestion.durationMinutes % 60}m)</span>
                        )}
                      </p>
                      <p className="text-xs text-indigo-500 mt-1 italic">{suggestion.reason}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rejectSuggestion(suggestion.id)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"
                      title="Reject"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => acceptSuggestion(suggestion)}
                      className="p-2 hover:bg-green-50 text-indigo-600 hover:text-green-600 rounded-lg transition"
                      title="Accept"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
               <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
