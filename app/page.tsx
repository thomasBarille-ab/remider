"use client";

import { TaskForm } from "@/components/TaskForm";
import { CalendarView } from "@/components/CalendarView";
import { SmartReview } from "@/components/SmartReview";
import { ClientOnly } from "@/components/ClientOnly";

export default function Home() {
  return (
    <ClientOnly>
      <main className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Planner</h1>
              <p className="text-gray-500">Organize your days with smart suggestions.</p>
            </div>
            
            {/* Smart Review Section Trigger */}
            <div className="w-full md:w-auto">
              <SmartReview />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Input */}
            <div className="lg:col-span-1 space-y-6">
              <TaskForm />
              
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
                <strong>Tip:</strong> The app learns from your tasks. Add tasks for this week, and next Sunday it will suggest a plan based on your history!
              </div>
            </div>

            {/* Right Column: Calendar */}
            <div className="lg:col-span-2">
              <CalendarView />
            </div>
          </div>
        </div>
      </main>
    </ClientOnly>
  );
}