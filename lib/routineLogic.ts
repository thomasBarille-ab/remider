import { Task } from "@/types";
import { addDays, addWeeks, startOfDay, isSameDay } from "date-fns";

export type RecurrenceType = "daily" | "weekly" | "interval";

export interface RecurrenceSettings {
  type: RecurrenceType;
  intervalDays?: number; // For "every X days"
  weekDays?: number[]; // For "weekly" (0=Sun, 1=Mon, etc.)
  endDate?: string; // Optional end date for the routine
}

export function generateRoutineTasks(baseTask: Task, settings: RecurrenceSettings, monthsToGenerate = 3): Task[] {
  const tasks: Task[] = [];
  const startDate = new Date(baseTask.date);
  // Limit generation to X months in the future to keep store light
  // In a real app, you'd generate these lazily or on the backend
  const limitDate = new Date();
  limitDate.setMonth(limitDate.getMonth() + monthsToGenerate);

  let currentDate = startDate;
  const routineId = crypto.randomUUID(); // Assign a unique ID for this batch

  // Safety break to prevent infinite loops
  let safetyCounter = 0;
  const MAX_TASKS = 365; // Max 1 year of daily tasks at once

  while (currentDate <= limitDate && safetyCounter < MAX_TASKS) {
    let shouldAdd = false;

    if (settings.type === "daily") {
      shouldAdd = true;
    } else if (settings.type === "interval" && settings.intervalDays) {
      // Logic handled by the increment at the end of loop
      shouldAdd = true; 
    } else if (settings.type === "weekly" && settings.weekDays) {
      const dayOfWeek = currentDate.getDay(); // 0-6
      if (settings.weekDays.includes(dayOfWeek)) {
        shouldAdd = true;
      }
    }

    if (shouldAdd) {
      // Don't duplicate the very first task if it's already added by the main logic, 
      // BUT here we will return a list of ALL tasks including the first one, 
      // and let the caller handle it. Actually, simpler: caller adds the returned list.
      
      const newTaskDate = new Date(currentDate);
      // Preserve the time from the base task
      const baseTime = new Date(baseTask.date);
      newTaskDate.setHours(baseTime.getHours(), baseTime.getMinutes(), 0, 0);

      tasks.push({
        ...baseTask,
        id: crypto.randomUUID(),
        date: newTaskDate.toISOString(),
        routineId: routineId,
        // Recalculate reminder for this specific date if it exists
        reminderTime: baseTask.reminderTime 
          ? calculateNewReminder(newTaskDate, new Date(baseTask.date), new Date(baseTask.reminderTime)) 
          : undefined
      });
    }

    // Increment Date
    if (settings.type === "interval" && settings.intervalDays) {
      currentDate = addDays(currentDate, settings.intervalDays);
    } else {
      // For daily and weekly, we check every day
      currentDate = addDays(currentDate, 1);
    }
    
    safetyCounter++;
  }

  return tasks;
}

function calculateNewReminder(newTaskDate: Date, originalTaskDate: Date, originalReminder: Date): string {
  const diff = originalTaskDate.getTime() - originalReminder.getTime();
  return new Date(newTaskDate.getTime() - diff).toISOString();
}
