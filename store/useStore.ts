import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Suggestion, CategoryItem } from '@/types';

interface AppState {
  tasks: Task[];
  suggestions: Suggestion[];
  categories: CategoryItem[];
  
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  removeRoutineTasks: (routineId: string) => void;
  toggleTask: (id: string) => void;
  
  addCategory: (category: CategoryItem) => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  removeCategory: (id: string) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  setSuggestions: (suggestions: Suggestion[]) => void;
  acceptSuggestion: (suggestion: Suggestion) => void;
  rejectSuggestion: (id: string) => void;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "Work", label: "Work", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "Personal", label: "Personal", color: "bg-green-100 text-green-700 border-green-200" },
  { id: "Health", label: "Health", color: "bg-red-100 text-red-700 border-red-200" },
  { id: "Social", label: "Social", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "Other", label: "Other", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      suggestions: [],
      categories: DEFAULT_CATEGORIES,

      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),

      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),

      removeRoutineTasks: (routineId) => set((state) => ({
        tasks: state.tasks.filter((t) => t.routineId !== routineId),
      })),

      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
        ),
      })),

      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),

      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      })),

      removeCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      })),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      setSuggestions: (suggestions) => set({ suggestions }),

      acceptSuggestion: (suggestion) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            id: crypto.randomUUID(),
            title: suggestion.title,
            category: suggestion.category,
            priority: "medium", // Default priority
            subtasks: [],
            date: suggestion.suggestedDate,
            isCompleted: false,
            reminderTime: undefined,
            durationMinutes: suggestion.durationMinutes,
          }
        ],
        suggestions: state.suggestions.filter(s => s.id !== suggestion.id)
      })),

      rejectSuggestion: (id) => set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== id)
      })),
    }),
    {
      name: 'smart-planner-storage',
    }
  )
);
