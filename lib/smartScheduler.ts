import { Task, Suggestion } from "@/types";
import { addDays, addWeeks, startOfDay, isSameDay, differenceInDays, getDay, isWeekend } from "date-fns";

export function generateSuggestions(tasks: Task[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const now = new Date();
  const nextWeekEnd = addDays(now, 7);

  // 1. Analyze Productivity Patterns (Frequency Analysis)
  // Group tasks by normalized title
  const groupedTasks: Record<string, Task[]> = {};
  tasks.forEach(t => {
    const key = t.title.toLowerCase().trim();
    if (!groupedTasks[key]) groupedTasks[key] = [];
    groupedTasks[key].push(t);
  });

  // Analyze groups
  Object.entries(groupedTasks).forEach(([key, group]) => {
    // Only analyze if performed at least 3 times
    if (group.length >= 3) {
      // Sort by date desc
      group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const lastTask = group[0];
      const lastDate = new Date(lastTask.date);
      
      // Calculate average interval
      let totalDays = 0;
      for (let i = 0; i < group.length - 1; i++) {
        totalDays += differenceInDays(new Date(group[i].date), new Date(group[i+1].date));
      }
      const avgInterval = Math.round(totalDays / (group.length - 1));

      // Predict next occurrence
      const nextDate = addDays(lastDate, avgInterval);

      // If predicted date is within the next 7 days and in the future
      if (nextDate >= startOfDay(now) && nextDate <= nextWeekEnd) {
        // Check for duplicates
        const exists = tasks.some(t => 
          t.title.toLowerCase() === key && 
          isSameDay(new Date(t.date), nextDate)
        );

        if (!exists) {
          suggestions.push({
            id: crypto.randomUUID(),
            title: lastTask.title,
            category: lastTask.category,
            suggestedDate: nextDate.toISOString(),
            reason: `Habituelle tous les ${avgInterval} jours environ`,
            durationMinutes: lastTask.durationMinutes,
          });
        }
      }
    }
  });

  // 2. Productivity Rituals (Contextual Suggestions)
  const currentDay = getDay(now); // 0=Sun, 1=Mon...

  // Sunday/Monday: Weekly Review
  if (currentDay === 0 || currentDay === 1) {
    const hasReview = tasks.some(t => 
      t.title.toLowerCase().includes("review") || 
      t.title.toLowerCase().includes("bilan") ||
      (isSameDay(new Date(t.date), now) && t.title.includes("Planification"))
    );

    if (!hasReview) {
      suggestions.push({
        id: crypto.randomUUID(),
        title: "Bilan Hebdomadaire",
        category: "Productivity", // Ensure this category exists or map to "Work"
        suggestedDate: now.toISOString(), // Suggest for today
        reason: "Commencez la semaine du bon pied !",
        durationMinutes: 30,
      });
    }
  }

  // Friday: Clean up
  if (currentDay === 5) {
    suggestions.push({
      id: crypto.randomUUID(),
      title: "Vider la boîte mail",
      category: "Work",
      suggestedDate: now.toISOString(),
      reason: "Finissez la semaine l'esprit léger",
      durationMinutes: 15,
    });
  }

  // 3. The "Forgotten" Category (Resurfacing)
  // Check if "Health" or "Sport" has been neglected
  const recentHealthTask = tasks.some(t => 
    (t.category === "Health" || t.category === "Sport") && 
    differenceInDays(now, new Date(t.date)) < 5
  );

  if (!recentHealthTask) {
    suggestions.push({
      id: crypto.randomUUID(),
      title: "Séance de Sport / Marche",
      category: "Health",
      suggestedDate: addDays(now, 1).toISOString(),
      reason: "Aucune activité santé détectée récemment",
      durationMinutes: 45,
    });
  }

  // 4. Weekend Context
  if (isWeekend(now)) {
    const hasSocial = tasks.some(t => 
      t.category === "Social" && 
      isSameDay(new Date(t.date), now)
    );

    if (!hasSocial) {
      suggestions.push({
        id: crypto.randomUUID(),
        title: "Appeler un proche",
        category: "Social",
        suggestedDate: now.toISOString(),
        reason: "C'est le week-end, profitez-en !",
        durationMinutes: 20,
      });
    }
  }

  // Deduplicate suggestions by title
  const uniqueSuggestions = suggestions.filter((s, index, self) =>
    index === self.findIndex((t) => (
      t.title === s.title && isSameDay(new Date(t.suggestedDate), new Date(s.suggestedDate))
    ))
  );

  // Return top 5 suggestions to avoid overwhelming
  return uniqueSuggestions.slice(0, 5);
}