import { Task, Suggestion } from "@/types";
import { addWeeks, isAfter, subDays, startOfDay, endOfDay } from "date-fns";

export function generateSuggestions(tasks: Task[]): Suggestion[] {
  // Simple Algorithm: 
  // Look at tasks from the last 2 weeks. 
  // If a task seems to be regular (or just for the sake of prototype, any task),
  // suggest it for the coming week on the same weekday.
  
  const suggestions: Suggestion[] = [];
  const now = new Date();
  
  // Filter relevant history (e.g., last 30 days to catch monthly, but let's stick to simple weekly recurrence)
  // For this prototype: Look at tasks from exactly 1 week ago (+/- 1 day to be generous)
  // And suggest them for the upcoming week.
  
  // Let's just take all non-completed tasks or even completed ones from the past and suggest them again?
  // User asked: "based on what I've already put".
  
  // Strategy: Group by title/category. If a task "Gym" appears, suggest "Gym" for next occurrence.
  // Implementation: Iterate tasks. If task date is in the past, propose a new one for next week (same weekday).
  
  // Limit to avoid spam: Only suggest if not already planned for next week.

  // 1. Get tasks from the past
  const pastTasks = tasks.filter(t => new Date(t.date) < now);

  pastTasks.forEach(task => {
    // Propose for next week (same day of week)
    const taskDate = new Date(task.date);
    const nextWeekDate = addWeeks(taskDate, 1);
    
    // If the suggestion is in the past (because the task was 2 weeks ago), keep adding weeks until it's in future
    let targetDate = nextWeekDate;
    while (targetDate < now) {
      targetDate = addWeeks(targetDate, 1);
    }
    
    // Only suggest for the immediate next week (next 7 days)
    const nextWeekEnd = addWeeks(now, 1);
    if (targetDate > nextWeekEnd) return;

    // Check if duplicate already exists in future tasks
    const exists = tasks.some(t => 
      t.title.toLowerCase() === task.title.toLowerCase() && 
      startOfDay(new Date(t.date)).getTime() === startOfDay(targetDate).getTime()
    );

    if (!exists) {
      // Check if we already have a suggestion for this
      const suggestionExists = suggestions.some(s => 
        s.title === task.title && 
        s.suggestedDate === targetDate.toISOString()
      );

      if (!suggestionExists) {
        suggestions.push({
          id: crypto.randomUUID(),
          title: task.title,
          category: task.category,
          suggestedDate: targetDate.toISOString(),
          reason: `You did this on ${taskDate.toLocaleDateString(undefined, { weekday: 'long' })}s usually.`,
          originalTaskId: task.id,
          durationMinutes: task.durationMinutes,
        });
      }
    }
  });

  return suggestions;
}
