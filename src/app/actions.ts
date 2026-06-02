"use server";

import { db } from "@/lib/db";
import { users, progress, modules, lessons } from "@/lib/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const ADMIN_EMAILS = ["admin@accompanist.com", "daniele.buatti@gmail.com"];

// --- User Management Actions ---
export async function ensureUserExists(userId: string, email: string, name?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.id, userId));
    if (existing.length === 0) {
      const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";
      await db.insert(users).values({
        id: userId,
        email,
        name: name || null,
        role,
      });
    }
  } catch (error) {
    console.error("Error ensuring user exists:", error);
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function updateUser(userId: string, data: { name?: string, role?: string }) {
  try {
    await db.update(users).set(data).where(eq(users.id, userId));
    revalidatePath("/admin/users");
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

// --- Progress Actions ---
export async function getProgress(userId: string) {
  try {
    const results = await db.select().from(progress).where(eq(progress.userId, userId));
    return results;
  } catch (error) {
    console.error("Error fetching progress:", error);
    return [];
  }
}

export async function saveVideoProgress(userId: string, lessonId: string, seconds: number) {
  try {
    await db.insert(progress)
      .values({ userId, lessonId, lastPosition: seconds })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: { lastPosition: seconds }
      });
  } catch (error) {
    console.error("Error saving video progress:", error);
  }
}

export async function toggleLessonProgress(userId: string, lessonId: string) {
  try {
    const existing = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));

    if (existing.length > 0 && existing[0].completedAt) {
      await db
        .update(progress)
        .set({ completedAt: null })
        .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));
      return { completed: false };
    } else {
      await db.insert(progress)
        .values({ userId, lessonId, completedAt: new Date() })
        .onConflictDoUpdate({
          target: [progress.userId, progress.lessonId],
          set: { completedAt: new Date() }
        });
      return { completed: true };
    }
  } catch (error) {
    console.error("Error toggling progress:", error);
    throw new Error("Failed to update progress");
  }
}

// --- Content Management Actions ---
export async function getCourseContent(isAdmin: boolean = false) {
  try {
    const allModules = await db.select().from(modules).orderBy(asc(modules.displayOrder));
    
    let allLessons;
    if (isAdmin) {
      allLessons = await db.select().from(lessons).orderBy(asc(lessons.displayOrder));
    } else {
      allLessons = await db.select().from(lessons).where(eq(lessons.isPublished, true)).orderBy(asc(lessons.displayOrder));
    }

    return allModules.map(mod => ({
      ...mod,
      lessons: allLessons.filter(lesson => lesson.moduleId === mod.id)
    })).filter(mod => isAdmin || mod.lessons.length > 0); // Hide empty modules for students
  } catch (error) {
    console.error("Error fetching course content:", error);
    return [];
  }
}

export async function updateLesson(
  lessonId: string, 
  data: { 
    title: string; 
    videoUrl: string; 
    notes: string; 
    adminNotes: string; 
    isPublished: boolean; 
    duration: string; 
  }
) {
  try {
    await db.update(lessons).set(data).where(eq(lessons.id, lessonId));
    revalidatePath("/portal");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw new Error("Failed to update lesson");
  }
}

export async function createModule(title: string) {
  try {
    const result = await db.insert(modules).values({ title }).returning();
    revalidatePath("/admin");
    return result[0];
  } catch (error) {
    console.error("Error creating module:", error);
    throw new Error("Failed to create module");
  }
}

export async function createLesson(moduleId: string, data: { title: string, videoUrl: string, duration: string, notes: string, adminNotes: string, isPublished: boolean }) {
  try {
    const result = await db.insert(lessons).values({ ...data, moduleId }).returning();
    revalidatePath("/admin");
    revalidatePath("/portal");
    return result[0];
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw new Error("Failed to create lesson");
  }
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