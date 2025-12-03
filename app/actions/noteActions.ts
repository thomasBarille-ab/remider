"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Note } from "@/types";

export async function getNotes(): Promise<Note[]> {
  try {
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
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
}

export async function createNote(title: string, content: string) {
  try {
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
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
}

export async function updateNote(id: string, title: string, content: string) {
  try {
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
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

export async function deleteNote(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await prisma.note.delete({
      where: { id, userId }
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}
