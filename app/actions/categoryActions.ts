"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { CategoryItem } from "@/types";

export async function getCategories() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { label: 'asc' }
    });

    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategoriesData = [
        { id: "Work", label: "Work", color: "bg-blue-100 text-blue-700 border-blue-200" },
        { id: "Personal", label: "Personal", color: "bg-green-100 text-green-700 border-green-200" },
        { id: "Health", label: "Health", color: "bg-red-100 text-red-700 border-red-200" },
        { id: "Social", label: "Social", color: "bg-purple-100 text-purple-700 border-purple-200" },
        { id: "Other", label: "Other", color: "bg-gray-100 text-gray-700 border-gray-200" },
      ];
      const createdCategories = [];
      for (const cat of defaultCategoriesData) {
        createdCategories.push(await prisma.category.create({
          data: { userId, ...cat }
        }));
      }
      revalidatePath("/");
      return createdCategories;
    }

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function createCategory(label: string, color: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const category = await prisma.category.create({
      data: {
        userId,
        label,
        color,
      }
    });

    revalidatePath("/");
    return category;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function updateCategory(id: string, updates: Partial<CategoryItem>) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const category = await prisma.category.update({
      where: { id, userId },
      data: updates
    });

    revalidatePath("/");
    return category;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await prisma.category.delete({
      where: { id, userId }
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}
