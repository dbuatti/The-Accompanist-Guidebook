"use server";

import { db } from "@/lib/db";
import { users, progress, modules, lessons } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Progress Actions ---
export async function getProgress(userId: string) {
  const results = await db.select().from(progress).where(eq(progress.userId, userId));
  return results.map(r => r.lessonId);
}

export async function toggleLessonProgress(userId: string, lessonId: string) {
  const existing = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));

  if (existing.length > 0) {
    await db
      .delete(progress)
      .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));
    return { completed: false };
  } else {
    await db.insert(progress).values({ userId, lessonId });
    return { completed: true };
  }
}

// --- Content Management Actions ---
export async function getCourseContent() {
  const allModules = await db.select().from(modules).orderBy(asc(modules.displayOrder));
  const allLessons = await db.select().from(lessons).orderBy(asc(lessons.displayOrder));

  return allModules.map(mod => ({
    ...mod,
    lessons: allLessons.filter(lesson => lesson.moduleId === mod.id)
  }));
}

export async function updateLesson(lessonId: string, data: { title: string, videoUrl: string, notes: string, duration: string }) {
  await db.update(lessons).set(data).where(eq(lessons.id, lessonId));
  revalidatePath("/portal");
  revalidatePath("/admin");
}

export async function createModule(title: string) {
  const result = await db.insert(modules).values({ title }).returning();
  revalidatePath("/admin");
  return result[0];
}

export async function createLesson(moduleId: string, data: { title: string, videoUrl: string, duration: string, notes: string }) {
  const result = await db.insert(lessons).values({ ...data, moduleId }).returning();
  revalidatePath("/admin");
  revalidatePath("/portal");
  return result[0];
}

// --- Auth Actions ---
export async function validateAccess(password: string) {
  if (password === "accompanist2026") {
    const guestId = "00000000-0000-0000-0000-000000000000";
    return { success: true, userId: guestId, role: 'user' };
  }
  if (password === "admin2026") {
    return { success: true, userId: "admin-id", role: 'admin' };
  }
  return { success: false };
}