import { create } from 'zustand';
import { Task, Suggestion, CategoryItem, Note } from '@/types';
import { createTask, updateTask, deleteTask, removeRoutineTasks as removeRoutineTasksAction } from '@/app/actions/taskActions';
import { createNote, updateNote, deleteNote } from '@/app/actions/noteActions';
import { createCategory, updateCategory as updateCategoryAction, deleteCategory } from '@/app/actions/categoryActions';

interface AppState {
  tasks: Task[];
  suggestions: Suggestion[];
  categories: CategoryItem[];
  notes: Note[];
  
  setTasks: (tasks: Task[]) => void;
  setNotes: (notes: Note[]) => void;
  setCategories: (categories: CategoryItem[]) => void;

  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  removeRoutineTasks: (routineId: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  
  addCategory: (category: Partial<CategoryItem>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;

  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  setSuggestions: (suggestions: Suggestion[]) => void;
  acceptSuggestion: (suggestion: Suggestion) => Promise<void>;
  rejectSuggestion: (id: string) => void;
}

export const useStore = create<AppState>()(
  (set, get) => ({
    tasks: [],
    suggestions: [],
    categories: [], // Categories now loaded from DB
    notes: [],

    setTasks: (tasks) => set({ tasks }),
    setNotes: (notes) => set({ notes }),
    setCategories: (categories) => set({ categories }),

    addTask: async (task) => {
      try {
        const newTask = await createTask(task);
        set((state) => ({
          tasks: [...state.tasks, newTask]
        }));
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    },

    updateTask: async (id, updates) => {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates as Task } : t)),
      }));
      try {
        await updateTask(id, updates);
      } catch (error) {
        console.error("Failed to update task:", error);
        // Revert optimistic update if API call fails
        // (Requires saving original state, more complex for this scope)
      }
    },

    removeTask: async (id) => {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
      try {
        await deleteTask(id);
      } catch (error) {
        console.error("Failed to remove task:", error);
        // Revert if API call fails
      }
    },

    removeRoutineTasks: async (routineId) => {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.filter((t) => t.routineId !== routineId),
      }));
      try {
        await removeRoutineTasksAction(routineId);
      } catch (error) {
        console.error("Failed to remove routine tasks:", error);
        // Revert if API call fails
      }
    },

    toggleTask: async (id) => {
      const taskToToggle = get().tasks.find(t => t.id === id);
      if (!taskToToggle) return;
      const newIsCompleted = !taskToToggle.isCompleted;

      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, isCompleted: newIsCompleted } : t
        ),
      }));
      try {
        await updateTask(id, { isCompleted: newIsCompleted });
      } catch (error) {
        console.error("Failed to toggle task completion:", error);
        // Revert if API call fails
      }
    },

    addCategory: async (category) => {
      try {
        const newCategory = await createCategory(category.label!, category.color!);
        set((state) => ({
          categories: [...state.categories, newCategory]
        }));
      } catch (error) {
        console.error("Failed to add category:", error);
      }
    },

    updateCategory: async (id, updates) => {
      // Optimistic update
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates as CategoryItem } : c)),
      }));
      try {
        await updateCategoryAction(id, updates);
      } catch (error) {
        console.error("Failed to update category:", error);
      }
    },

    removeCategory: async (id) => {
      // Optimistic update
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error("Failed to remove category:", error);
      }
    },

    addNote: async (note) => {
      try {
        const newNote = await createNote(note.title!, note.content!);
        set((state) => ({
          notes: [newNote, ...(state.notes || [])]
        }));
      } catch (error) {
        console.error("Failed to add note:", error);
      }
    },

    updateNote: async (id, updates) => {
      // Optimistic update
      set((state) => ({
        notes: (state.notes || []).map((n) => (n.id === id ? { ...n, ...updates as Note } : n)),
      }));
      try {
        await updateNote(id, updates.title!, updates.content!); // Assuming title and content are always provided for updates
      } catch (error) {
        console.error("Failed to update note:", error);
      }
    },

    deleteNote: async (id) => {
      // Optimistic update
      set((state) => ({
        notes: (state.notes || []).filter((n) => n.id !== id),
      }));
      try {
        await deleteNote(id);
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    },

    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),

    setSuggestions: (suggestions) => set({ suggestions }),

    acceptSuggestion: async (suggestion) => {
      try {
        const acceptedTask = await createTask({
          title: suggestion.title,
          category: suggestion.category,
          priority: "medium", // Default priority
          subtasks: [],
          date: new Date(suggestion.suggestedDate),
          isCompleted: false,
          reminderTime: undefined,
          durationMinutes: suggestion.durationMinutes,
        });
        set((state) => ({
          tasks: [...state.tasks, acceptedTask],
          suggestions: state.suggestions.filter(s => s.id !== suggestion.id)
        }));
      } catch (error) {
        console.error("Failed to accept suggestion:", error);
      }
    },

    rejectSuggestion: (id) => set((state) => ({
      suggestions: state.suggestions.filter(s => s.id !== id)
    })),
  })
);
