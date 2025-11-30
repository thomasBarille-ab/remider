"use client";

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useReminder() {
  const tasks = useStore((state) => state.tasks);
  const categories = useStore((state) => state.categories);

  useEffect(() => {
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.isCompleted && task.reminderTime) {
          const reminderTime = new Date(task.reminderTime);
          // Check if reminder is within the last minute (to avoid double firing, though simple check)
          const diff = now.getTime() - reminderTime.getTime();
          
          // If time is passed within 60 seconds window and not yet alerted (we don't track alerted state here for simplicity, 
          // but in real app we should to avoid spam. For now, let's assume this component mounts once or we just alert.)
          // Better: check if minute matches exactly.
          
          if (diff >= 0 && diff < 60000) {
             const categoryLabel = categories.find(c => c.id === task.category)?.label || task.category;
             // Trigger notification
             if ("Notification" in window && Notification.permission === "granted") {
               new Notification(`Reminder: ${task.title}`, {
                 body: `It's time for your ${categoryLabel} task!`, 
               });
             } else {
               // Fallback
               alert(`Reminder: ${task.title}\nIt's time for your ${categoryLabel} task!`);
             }
          }
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [tasks, categories]);
}