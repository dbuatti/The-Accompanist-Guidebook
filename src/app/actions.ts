"use server";

import { db } from "@/lib/db";
import { users, progress } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

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

// Simple mock auth for this guidebook
export async function validateAccess(password: string) {
  if (password === "accompanist2024") {
    // In a real app, we'd find or create a specific user record here
    // For this demo, we'll use a static UUID for the "guest" user
    const guestId = "00000000-0000-0000-0000-000000000000";
    return { success: true, userId: guestId };
  }
  return { success: false };
}