"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Task, Subtask, Priority } from "@/types";
import { revalidatePath } from "next/cache";

// Helper to ensure Prisma result matches Task interface exactly
function serializeTask(prismaTask: any): Task {
  return {
    ...prismaTask,
    date: new Date(prismaTask.date),
    reminderTime: prismaTask.reminderTime ? new Date(prismaTask.reminderTime) : undefined,
    priority: prismaTask.priority as Priority,
    durationMinutes: prismaTask.durationMinutes ?? undefined,
    routineId: prismaTask.routineId ?? undefined,
    source: prismaTask.source ?? undefined,
    isExternal: prismaTask.isExternal ?? false,
    createdAt: new Date(prismaTask.createdAt),
    updatedAt: new Date(prismaTask.updatedAt),
  };
}

export async function getTasks() {
  const { userId } = await auth();
  if (!userId) return [];

  const prismaTasks = await prisma.task.findMany({
    where: { userId },
    include: { subtasks: true },
    orderBy: { date: 'asc' }
  });

  return prismaTasks.map(serializeTask);
}

export async function createTask(task: Partial<Task>) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    if (!task.title || !task.date || !task.category || !task.priority) {
      console.error("Missing required fields:", task);
      throw new Error("Missing required fields");
    }

    const subtasksData = task.subtasks?.map(s => ({
      title: s.title,
      isCompleted: s.isCompleted
    })) || [];

    console.log("Creating task for user:", userId);
    console.log("Task data:", JSON.stringify(task, null, 2));

    const newTask = await prisma.task.create({
      data: {
        title: task.title!,
        userId,
        category: task.category!,
        priority: task.priority!,
        date: new Date(task.date!),
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : null,
        durationMinutes: task.durationMinutes ?? null,
        routineId: task.routineId ?? null,
        subtasks: {
          create: subtasksData
        }
      },
      include: { subtasks: true }
    });

    console.log("Task created successfully:", newTask.id);
    revalidatePath("/");
    return serializeTask(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const updatedTask = await prisma.task.update({
    where: { id, userId },
    data: {
      title: updates.title,
      category: updates.category,
      priority: updates.priority,
      isCompleted: updates.isCompleted,
      date: updates.date ? new Date(updates.date) : undefined,
      durationMinutes: updates.durationMinutes,
      // Note: we don't usually update subtasks here with this simplified logic
    },
    include: { subtasks: true }
  });

  revalidatePath("/");
  return serializeTask(updatedTask);
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