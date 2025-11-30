export interface CategoryItem {
  id: string;
  label: string;
  color: string;
}

export type Category = string;
export type Priority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  date: string; // ISO Date String
  isCompleted: boolean;
  reminderTime?: string; // ISO Date String
  durationMinutes?: number; // Duration of the task in minutes
  routineId?: string; // ID to link recurring tasks
  subtasks: Subtask[];
  isExternal?: boolean; // If true, the task comes from an external calendar
  source?: string; // e.g., "Google", "Outlook", "Runna"
}

export interface Suggestion {
  id: string;
  originalTaskId?: string; // If based on a recurring pattern
  title: string;
  category: Category;
  suggestedDate: string;
  reason: string;
  durationMinutes?: number; // Duration of the suggested task in minutes
}
