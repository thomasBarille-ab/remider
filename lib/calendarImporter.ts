import ICAL from "ical.js";
import { Task } from "@/types";

export function parseICS(icsData: string, source: string): Task[] {
  try {
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    const tasks: Task[] = [];

    vevents.forEach((vevent) => {
      try {
        const event = new ICAL.Event(vevent);
        const summary = event.summary || "Untitled Event";
        
        if (!event.startDate) return;

        let startDate: Date;
        try {
          startDate = event.startDate.toJSDate();
        } catch (e) {
          console.warn(`Invalid start date for event: ${summary}`, e);
          return;
        }

        let endDate: Date;
        try {
          endDate = event.endDate ? event.endDate.toJSDate() : new Date(startDate.getTime() + 60 * 60 * 1000);
        } catch (e) {
          console.warn(`Invalid end date for event: ${summary}, defaulting to 1 hour duration`, e);
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }

        const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;

        tasks.push({
          id: crypto.randomUUID(),
          title: summary,
          category: "External",
          priority: "medium",
          date: startDate.toISOString(),
          isCompleted: false,
          durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
          subtasks: [],
          isExternal: true,
          source: source,
        });
      } catch (err) {
        console.warn("Skipping malformed event", err);
      }
    });

    return tasks;
  } catch (e) {
    console.error("Error parsing ICS", e);
    return [];
  }
}
