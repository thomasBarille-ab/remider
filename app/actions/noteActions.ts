"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getNotes() {
  const { userId } = await auth();
  if (!userId) return [];

  return await prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  });
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
  return note;
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
  return note;
}

export async function deleteNote(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.note.delete({
    where: { id, userId }
  });

  revalidatePath("/");
}
