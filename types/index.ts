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
  userId: string;
  category: Category;
  priority: Priority;
  date: Date; // Date object
  isCompleted: boolean;
  reminderTime?: Date; // Date object
  durationMinutes?: number; // Duration of the task in minutes
  routineId?: string; // ID to link recurring tasks
  subtasks: Subtask[];
  isExternal?: boolean; // If true, the task comes from an external calendar
  source?: string; // e.g., "Google", "Outlook", "Runna"
  createdAt: Date;
  updatedAt: Date;
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

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date; // Date object
  updatedAt: Date; // Date object
}
