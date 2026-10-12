import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { users, progress, lessons } from "@/lib/schema";
import { getErrorMessage } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";

export async function getLearnerStats() {
  await requireAdmin();
  try {
    const allUsers = await db.select().from(users);
    const allProgress = await db.select().from(progress);
    const allLessons = await db.select().from(lessons);

    const totalUsers = allUsers.length;
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const signupsThisMonth = allUsers.filter(u => new Date(u.createdAt) >= monthAgo).length;

    // Per-lesson completion counts
    const lessonCompletion: Record<string, number> = {};
    for (const p of allProgress) {
      if (p.completedAt) {
        lessonCompletion[p.lessonId] = (lessonCompletion[p.lessonId] || 0) + 1;
      }
    }

    // Top 5 most-completed lessons
    const lessonMap = new Map(allLessons.map(l => [l.id, l]));
    type LessonRow = typeof lessons.$inferSelect;
    const topLessons = Object.entries(lessonCompletion)
      .map(([lessonId, count]) => ({ lesson: lessonMap.get(lessonId), completions: count }))
      .filter((x): x is { lesson: LessonRow; completions: number } => x.lesson != null)
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 5);

    // Per-user progress
    const userProgressCount: Record<string, number> = {};
    for (const p of allProgress) {
      if (p.completedAt) {
        userProgressCount[p.userId] = (userProgressCount[p.userId] || 0) + 1;
      }
    }

    const totalCompletions = allProgress.filter(p => p.completedAt).length;

    return {
      totalUsers,
      signupsThisMonth,
      totalCompletions,
      totalProgressRows: allProgress.length,
      topLessons,
      userProgressCount,
    };
  } catch (error) {
    logger.error("Error fetching learner stats:", getErrorMessage(error));
    return null;
  }
}
