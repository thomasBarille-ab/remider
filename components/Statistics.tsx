"use client";

import { useStore } from "@/store/useStore";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

export function Statistics() {
  const tasks = useStore((state) => state.tasks);
  const categories = useStore((state) => state.categories);

  // 1. Completion Rate
  const completionStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, rate };
  }, [tasks]);

  // 2. Tasks by Category (Pie Chart Data)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    return categories.map(cat => ({
      name: cat.label,
      value: counts[cat.id] || 0,
      color: extractColor(cat.color)
    })).filter(d => d.value > 0);
  }, [tasks, categories]);

  // 3. Activity this week (Bar Chart Data)
  const weeklyActivityData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));
      return {
        name: format(day, "EEE"), // Mon, Tue...
        completed: dayTasks.filter(t => t.isCompleted).length,
        pending: dayTasks.filter(t => !t.isCompleted).length,
      };
    });
  }, [tasks]);

  // Helper to extract hex/rgb from tailwind class string implies simplistic mapping or using CSS variables
  // For simplicity, we'll map standard tailwind colors to hex codes approx
  function extractColor(className: string) {
    if (className.includes("blue")) return "#3b82f6";
    if (className.includes("green")) return "#22c55e";
    if (className.includes("red")) return "#ef4444";
    if (className.includes("purple")) return "#a855f7";
    if (className.includes("yellow")) return "#eab308";
    if (className.includes("pink")) return "#ec4899";
    if (className.includes("indigo")) return "#6366f1";
    if (className.includes("orange")) return "#f97316";
    if (className.includes("teal")) return "#14b8a6";
    return "#9ca3af"; // Gray default
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center">
         <h3 className="text-gray-500 dark:text-gray-400 font-semibold mb-2">Completion Rate</h3>
         <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100 dark:text-gray-800"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * completionStats.rate) / 100}
                className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-2xl font-bold text-gray-800 dark:text-white">{completionStats.rate}%</span>
         </div>
         <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{completionStats.completed} / {completionStats.total} Tasks Done</p>
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-gray-500 dark:text-gray-400 font-semibold mb-4 text-center">Tasks by Category</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#f3f4f6' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 md:col-span-2">
        <h3 className="text-gray-500 dark:text-gray-400 font-semibold mb-4">Weekly Activity</h3>
        <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={weeklyActivityData}>
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
               <YAxis hide />
               <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#f3f4f6' }}
                 cursor={{fill: '#374151'}}
               />
               <Bar dataKey="completed" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
               <Bar dataKey="pending" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
