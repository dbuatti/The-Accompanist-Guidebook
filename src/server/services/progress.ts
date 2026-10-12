import { db } from "@/lib/db";
import { progress } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getErrorMessage } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { parseUuid, parse, nonNegativeInt } from "@/lib/validation";

export async function getProgress() {
  try {
    const user = await requireUser();
    const results = await db.select().from(progress).where(eq(progress.userId, user.id));
    return results;
  } catch (error) {
    console.error("Error fetching progress (FULL ERROR):", getErrorMessage(error));
    return [];
  }
}

export async function saveVideoProgress(lessonId: string, seconds: number) {
  try {
    const user = await requireUser();
    lessonId = parseUuid(lessonId, "lessonId");
    seconds = parse(nonNegativeInt, seconds);
    await db.insert(progress)
      // completedAt must be explicit: the column defaults to now(), which would
      // mark a lesson complete the first time any watch position is saved.
      .values({ userId: user.id, lessonId, lastPosition: Math.max(0, Math.floor(seconds)), completedAt: null })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: { lastPosition: Math.max(0, Math.floor(seconds)) },
      });
  } catch (error) {
    console.error("Error saving video progress (FULL ERROR):", getErrorMessage(error));
  }
}

export async function toggleLessonProgress(lessonId: string) {
  try {
    const user = await requireUser();
    lessonId = parseUuid(lessonId, "lessonId");
    const existing = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, user.id), eq(progress.lessonId, lessonId)));

    if (existing.length > 0 && existing[0].completedAt) {
      // Un-completing deletes the row rather than setting completed_at to
      // NULL: in production that column rejects NULL (un-ticking a lesson
      // returned a 500), and a missing row already means "not complete".
      await db
        .delete(progress)
        .where(and(eq(progress.userId, user.id), eq(progress.lessonId, lessonId)));
      return { completed: false };
    } else {
      await db.insert(progress)
        .values({ userId: user.id, lessonId, completedAt: new Date() })
        .onConflictDoUpdate({
          target: [progress.userId, progress.lessonId],
          set: { completedAt: new Date() },
        });
      return { completed: true };
    }
  } catch (error) {
    console.error("Error toggling progress (FULL ERROR):", getErrorMessage(error));
    throw new Error("Failed to update progress: " + getErrorMessage(error));
  }
}
