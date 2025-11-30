export interface CategoryItem {
  id: string;
  label: string;
  color: string;
}

export type Category = string;

export interface Task {
  id: string;
  title: string;
  category: Category;
  date: string; // ISO Date String
  isCompleted: boolean;
  reminderTime?: string; // ISO Date String
  durationMinutes?: number; // Duration of the task in minutes
  routineId?: string; // ID to link recurring tasks
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
