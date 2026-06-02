"use server";

import { db } from "@/lib/db";
import { levels, modules, lessons } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCourseContent(isAdmin: boolean = false) {
  try {
    const allLevels = await db.select().from(levels).orderBy(asc(levels.displayOrder));
    const allModules = await db.select().from(modules).orderBy(asc(modules.displayOrder));
    
    let allLessons;
    if (isAdmin) {
      allLessons = await db.select().from(lessons).orderBy(asc(lessons.displayOrder));
    } else {
      allLessons = await db.select().from(lessons).where(eq(lessons.isPublished, true)).orderBy(asc(lessons.displayOrder));
    }

    // Map 3-tier structure: Levels -> Modules -> Lessons
    return allLevels.map(lvl => {
      const lvlModules = allModules.filter(mod => mod.levelId === lvl.id).map(mod => ({
        ...mod,
        lessons: allLessons.filter(lesson => lesson.moduleId === mod.id)
      })).filter(mod => isAdmin || mod.lessons.length > 0);

      return {
        ...lvl,
        modules: lvlModules
      };
    }).filter(lvl => isAdmin || lvl.modules.length > 0);
  } catch (error) {
    console.error("Error fetching course content:", error);
    return [];
  }
}

export async function getLevelsOnly() {
  try {
    return await db.select().from(levels).orderBy(asc(levels.displayOrder));
  } catch (error) {
    console.error("Error fetching levels:", error);
    return [];
  }
}

export async function createLevel(title: string) {
  try {
    const result = await db.insert(levels).values({ title }).returning();
    revalidatePath("/admin");
    return result[0];
  } catch (error) {
    console.error("Error creating level:", error);
    throw new Error("Failed to create level");
  }
}

export async function createModule(title: string, levelId?: string) {
  try {
    const result = await db.insert(modules).values({ title, levelId: levelId || null }).returning();
    revalidatePath("/admin");
    return result[0];
  } catch (error) {
    console.error("Error creating module:", error);
    throw new Error("Failed to create module");
  }
}

export async function updateModuleLevel(moduleId: string, levelId: string | null) {
  try {
    await db.update(modules).set({ levelId }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
  } catch (error) {
    console.error("Error updating module level:", error);
    throw new Error("Failed to update module level");
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
    hasVideo?: boolean;
    videoStatus?: string;
    filmingDate?: Date | null;
  }
) {
  try {
    await db.update(lessons).set({
      title: data.title,
      videoUrl: data.videoUrl,
      notes: data.notes,
      adminNotes: data.adminNotes,
      isPublished: data.isPublished,
      duration: data.duration,
      hasVideo: data.hasVideo ?? true,
      videoStatus: data.videoStatus ?? 'not_started',
      filmingDate: data.filmingDate ?? null,
    }).where(eq(lessons.id, lessonId));
    revalidatePath("/portal");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw new Error("Failed to update lesson");
  }
}

export async function createLesson(moduleId: string, data: { title: string, videoUrl: string, duration: string, notes: string, adminNotes: string, isPublished: boolean, hasVideo?: boolean, videoStatus?: string, filmingDate?: Date | null }) {
  try {
    const result = await db.insert(lessons).values({ 
      ...data, 
      moduleId,
      hasVideo: data.hasVideo ?? true,
      videoStatus: data.videoStatus ?? 'not_started',
      filmingDate: data.filmingDate ?? null,
    }).returning();
    revalidatePath("/admin");
    revalidatePath("/portal");
    return result[0];
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw new Error("Failed to create lesson");
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    revalidatePath("/admin");
    revalidatePath("/portal");
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw new Error("Failed to delete lesson");
  }
}