"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Note } from "@/types";

export async function getNotes(): Promise<Note[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const prismaNotes = await prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  });

  // Convert date strings to Date objects and ensure userId is present
  const notes: Note[] = prismaNotes.map(note => ({
    ...note,
    userId,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
  }));

  return notes;
}

export async function createNote(title: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const note = await prisma.note.create({
    data: {
      userId,
      title,
      content,
    }
  });

  revalidatePath("/");
  // Ensure the returned note has Date objects for createdAt and updatedAt
  return { ...note, createdAt: new Date(note.createdAt), updatedAt: new Date(note.updatedAt) };
}

export async function updateNote(id: string, title: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const note = await prisma.note.update({
    where: { id, userId },
    data: {
      title,
      content,
    }
  });

  revalidatePath("/");
  // Ensure the returned note has Date objects for createdAt and updatedAt
  return { ...note, createdAt: new Date(note.createdAt), updatedAt: new Date(note.updatedAt) };
}

export async function deleteNote(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.note.delete({
    where: { id, userId }
  });

  revalidatePath("/");
}
