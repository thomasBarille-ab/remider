"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Task, Subtask, Priority } from "@/types"; // We might need to adjust types to match Prisma return types if they differ slightly
import { revalidatePath } from "next/cache";

export async function getTasks() {
  const { userId } = await auth();
  if (!userId) return [];

  const prismaTasks = await prisma.task.findMany({
    where: { userId },
    include: { subtasks: true },
    orderBy: { date: 'asc' }
  });

  // Explicitly cast 'priority' to 'Priority' type
  const tasks: Task[] = prismaTasks.map(task => ({
    ...task,
    date: new Date(task.date),
    reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
    priority: task.priority as Priority, // Cast string from DB to Priority type
  }));

  return tasks;
}

export async function createTask(task: Partial<Task>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Format subtasks for Prisma create
  const subtasksData = task.subtasks?.map(s => ({
    title: s.title,
    isCompleted: s.isCompleted
  })) || [];

  const newTask = await prisma.task.create({
    data: {
      title: task.title!,
      userId,
      category: task.category!,
      priority: task.priority!,
      date: new Date(task.date!), // Ensure ISO string is converted
      reminderTime: task.reminderTime ? new Date(task.reminderTime) : null,
      durationMinutes: task.durationMinutes,
      routineId: task.routineId,
      subtasks: {
        create: subtasksData
      }
    },
    include: { subtasks: true }
  });

  revalidatePath("/");
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Handle subtasks separately if needed, but for now simple updates
  // For subtask updates, it's more complex (create, update, delete). 
  // Simplified strategy: Update main fields. Subtask management might need dedicated actions if complex.
  
  const updatedTask = await prisma.task.update({
    where: { id, userId },
    data: {
      title: updates.title,
      category: updates.category,
      priority: updates.priority,
      isCompleted: updates.isCompleted,
      date: updates.date ? new Date(updates.date) : undefined,
      durationMinutes: updates.durationMinutes,
    }
  });

  revalidatePath("/");
  return updatedTask;
}

export async function deleteTask(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.delete({
    where: { id, userId }
  });

  revalidatePath("/");
}

export async function removeRoutineTasks(routineId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.deleteMany({
    where: { routineId, userId }
  });

  revalidatePath("/");
}
