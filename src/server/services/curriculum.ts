import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { users, levels, modules, lessons, resources, progress } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getErrorMessage } from "@/lib/errors";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { ADMIN_EMAILS } from "@/lib/admin";
import { parseUuid, parseText, urlSchema, parse, text, optionalText } from "@/lib/validation";
import { dedupeSlug, uniqueModuleSlug, uniqueLessonSlug } from "./slugs";
import type { CourseLevelPreview } from "@/lib/types";

// --- Public marketing stats (no auth — aggregate counts only, no titles/content) ---
export async function getPublicCourseStats() {
  try {
    const [levelRows, moduleRows, lessonRows] = await Promise.all([
      db.select().from(levels),
      db.select().from(modules).where(eq(modules.isPublished, true)),
      db.select().from(lessons).where(eq(lessons.isPublished, true)),
    ]);
    return { levelCount: levelRows.length, moduleCount: moduleRows.length, lessonCount: lessonRows.length };
  } catch (error) {
    logger.error("Error fetching public course stats:", getErrorMessage(error));
    return { levelCount: 3, moduleCount: 13, lessonCount: 49 };
  }
}

// --- Public curriculum preview (no auth — published modules + lesson titles for the sales page) ---
export async function getPublicCurriculumPreview(): Promise<CourseLevelPreview[]> {
  try {
    const [levelRows, moduleRows, lessonRows] = await Promise.all([
      db.select().from(levels).orderBy(asc(levels.displayOrder)),
      db.select().from(modules).where(eq(modules.isPublished, true)).orderBy(asc(modules.displayOrder)),
      db.select().from(lessons).where(eq(lessons.isPublished, true)).orderBy(asc(lessons.displayOrder)),
    ]);
    return levelRows
      .map((lvl) => ({
        id: lvl.id,
        title: lvl.title,
        displayOrder: lvl.displayOrder,
        modules: moduleRows
          .filter((mod) => mod.levelId === lvl.id)
          .map((mod) => ({
            id: mod.id,
            title: mod.title,
            slug: mod.slug,
            displayOrder: mod.displayOrder,
            lessons: lessonRows
              .filter((lesson) => lesson.moduleId === mod.id)
              .map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                slug: lesson.slug,
                hasVideo: !!lesson.videoUrl,
                displayOrder: lesson.displayOrder,
              })),
          })),
      }))
      .filter((lvl) => lvl.modules.length > 0);
  } catch (error) {
    logger.error("Error fetching public curriculum preview:", getErrorMessage(error));
    return [];
  }
}

export async function getCourseContent() {
  try {
    const user = await getCurrentUser();
    const isAdmin = ADMIN_EMAILS.includes((user?.email || "").toLowerCase());

    let isPaid = false;
    if (user) {
      const dbUser = await db.select().from(users).where(eq(users.id, user.id));
      isPaid = dbUser.length > 0 && dbUser[0].isPaid === true;
    }

    const allLevels = await db.select().from(levels).orderBy(asc(levels.displayOrder));
    const allModules = await db.select().from(modules).orderBy(asc(modules.displayOrder));

    let allLessons;
    if (isAdmin) {
      allLessons = await db.select().from(lessons).orderBy(asc(lessons.displayOrder));
    } else {
      allLessons = await db.select().from(lessons).where(eq(lessons.isPublished, true)).orderBy(asc(lessons.displayOrder));
    }

    if (!isAdmin && !isPaid) return [];

    const allResources = await db.select().from(resources).orderBy(asc(resources.displayOrder));

    const resourceMap = new Map<string, (typeof resources.$inferSelect)[]>();
    for (const r of allResources) {
      if (!resourceMap.has(r.lessonId)) resourceMap.set(r.lessonId, []);
      resourceMap.get(r.lessonId)!.push(r);
    }

    let moduleNumber = 0;
    return allLevels.map(lvl => {
      const lvlModules = allModules.filter(mod => mod.levelId === lvl.id).map(mod => {
        moduleNumber++;
        return {
          ...mod,
          moduleNumber,
          lessons: allLessons.filter(lesson => lesson.moduleId === mod.id).map(lesson => ({
            ...lesson,
            resources: resourceMap.get(lesson.id) || [],
          }))
        };
      }).filter(mod => {
        if (isAdmin) return true;
        return mod.lessons.length > 0;
      });

      return {
        ...lvl,
        modules: lvlModules
      };
    }).filter(lvl => isAdmin || lvl.modules.length > 0);
  } catch (error) {
    logger.error("Error fetching course content:", getErrorMessage(error));
    return [];
  }
}

export async function getLevelsOnly() {
  try {
    return await db.select().from(levels).orderBy(asc(levels.displayOrder));
  } catch (error) {
    logger.error("Error fetching levels:", getErrorMessage(error));
    return [];
  }
}

export async function createLevel(title: string) {
  await requireAdmin();
  title = parseText(title, 200, "title");
  try {
    const result = await db.insert(levels).values({ title }).returning();
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    return result[0];
  } catch (error) {
    logger.error("Error creating level:", getErrorMessage(error));
    throw new Error("Failed to create level: " + getErrorMessage(error));
  }
}

export async function updateLevel(levelId: string, title: string) {
  await requireAdmin();
  levelId = parseUuid(levelId, "levelId");
  title = parseText(title, 200, "title");
  try {
    await db.update(levels).set({ title }).where(eq(levels.id, levelId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error) {
    logger.error("Error updating level:", getErrorMessage(error));
    throw new Error("Failed to update level: " + getErrorMessage(error));
  }
}

export async function deleteLevel(levelId: string) {
  await requireAdmin();
  levelId = parseUuid(levelId, "levelId");
  try {
    // Set levelId to null for any modules in this level
    await db.update(modules).set({ levelId: null }).where(eq(modules.levelId, levelId));
    await db.delete(levels).where(eq(levels.id, levelId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error) {
    logger.error("Error deleting level:", getErrorMessage(error));
    throw new Error("Failed to delete level: " + getErrorMessage(error));
  }
}

export async function createModule(title: string, levelId?: string) {
  await requireAdmin();
  title = parseText(title, 200, "title");
  if (levelId) levelId = parseUuid(levelId, "levelId");
  try {
    const slug = await uniqueModuleSlug(title);
    const result = await db.insert(modules).values({ title, slug, levelId: levelId || null }).returning();
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    return result[0];
  } catch (error) {
    logger.error("Error creating module:", getErrorMessage(error));
    throw new Error("Failed to create module: " + getErrorMessage(error));
  }
}

export async function updateModule(moduleId: string, title: string) {
  await requireAdmin();
  moduleId = parseUuid(moduleId, "moduleId");
  title = parseText(title, 200, "title");
  try {
    await db.update(modules).set({ title }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error) {
    logger.error("Error updating module:", getErrorMessage(error));
    throw new Error("Failed to update module: " + getErrorMessage(error));
  }
}

export async function deleteModule(moduleId: string) {
  await requireAdmin();
  moduleId = parseUuid(moduleId, "moduleId");
  try {
    await db.delete(modules).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error) {
    logger.error("Error deleting module:", getErrorMessage(error));
    throw new Error("Failed to delete module: " + getErrorMessage(error));
  }
}

export async function updateModuleLevel(moduleId: string, levelId: string | null) {
  await requireAdmin();
  moduleId = parseUuid(moduleId, "moduleId");
  if (levelId) levelId = parseUuid(levelId, "levelId");
  try {
    await db.update(modules).set({ levelId }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error) {
    logger.error("Error updating module level:", getErrorMessage(error));
    throw new Error("Failed to update module level: " + getErrorMessage(error));
  }
}

export async function updateLesson(
  lessonId: string,
  data: {
    title: string;
    videoUrl: string;
    notes: string;
    adminNotes: string;
    cliffnotes?: string;
    isPublished: boolean;
    duration: string;
    hasVideo?: boolean;
    videoStatus?: string;
    filmingDate?: Date | null;
  }
) {
  await requireAdmin();
  lessonId = parseUuid(lessonId, "lessonId");
  data.title = parseText(data.title, 200, "title");
  data.videoUrl = parse(urlSchema, data.videoUrl);
  data.duration = parse(text(20), data.duration);
  data.notes = parseText(data.notes, 100000, "notes");
  data.adminNotes = parseText(data.adminNotes, 100000, "adminNotes");
  if (data.cliffnotes !== undefined) data.cliffnotes = parse(optionalText(100000), data.cliffnotes) ?? undefined;
  data.isPublished = parse(z.boolean(), data.isPublished);
  try {
    await db.update(lessons).set({
      title: data.title,
      videoUrl: data.videoUrl,
      notes: data.notes,
      adminNotes: data.adminNotes,
      cliffnotes: data.cliffnotes,
      isPublished: data.isPublished,
      duration: data.duration,
      hasVideo: data.hasVideo ?? true,
      videoStatus: data.videoStatus ?? 'not_started',
      filmingDate: data.filmingDate ?? null,
    }).where(eq(lessons.id, lessonId));
    revalidatePath("/modules");
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
  } catch (error) {
    logger.error("Error updating lesson:", getErrorMessage(error));
    throw new Error("Failed to update lesson: " + getErrorMessage(error));
  }
}

export async function createLesson(moduleId: string, data: { title: string, videoUrl: string, duration: string, notes: string, adminNotes: string, isPublished: boolean, hasVideo?: boolean, videoStatus?: string, filmingDate?: Date | null }) {
  await requireAdmin();
  moduleId = parseUuid(moduleId, "moduleId");
  data.title = parseText(data.title, 200, "title");
  data.videoUrl = parse(urlSchema, data.videoUrl);
  data.duration = parse(text(20), data.duration);
  data.notes = parseText(data.notes, 100000, "notes");
  data.adminNotes = parseText(data.adminNotes, 100000, "adminNotes");
  data.isPublished = parse(z.boolean(), data.isPublished);
  try {
    const slug = await uniqueLessonSlug(moduleId, data.title);
    const result = await db.insert(lessons).values({
      ...data,
      moduleId,
      slug,
      hasVideo: data.hasVideo ?? true,
      videoStatus: data.videoStatus ?? 'not_started',
      filmingDate: data.filmingDate ?? null,
    }).returning();
    revalidatePath("/admin");
    revalidatePath("/modules");
    revalidatePath("/admin/tree");
    return result[0];
  } catch (error) {
    logger.error("Error creating lesson:", getErrorMessage(error));
    throw new Error("Failed to create lesson: " + getErrorMessage(error));
  }
}

export async function deleteLesson(lessonId: string) {
  await requireAdmin();
  lessonId = parseUuid(lessonId, "lessonId");
  try {
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    revalidatePath("/admin");
    revalidatePath("/modules");
    revalidatePath("/admin/tree");
  } catch (error) {
    logger.error("Error deleting lesson:", getErrorMessage(error));
    throw new Error("Failed to delete lesson: " + getErrorMessage(error));
  }
}

export async function reorderLesson(lessonId: string, direction: "up" | "down") {
  await requireAdmin();
  lessonId = parseUuid(lessonId, "lessonId");
  direction = parse(z.enum(["up", "down"]), direction);
  try {
    const [current] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!current) throw new Error("Lesson not found");

    const siblings = await db.select()
      .from(lessons)
      .where(eq(lessons.moduleId, current.moduleId))
      .orderBy(asc(lessons.displayOrder));

    const idx = siblings.findIndex(l => l.id === lessonId);
    if (idx === -1) throw new Error("Lesson not found in module");

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      return { success: true, message: "Already at edge" };
    }

    const swapLesson = siblings[swapIdx];
    const currentOrder = current.displayOrder ?? idx;
    const swapOrder = swapLesson.displayOrder ?? swapIdx;

    await db.update(lessons).set({ displayOrder: swapOrder }).where(eq(lessons.id, current.id));
    await db.update(lessons).set({ displayOrder: currentOrder }).where(eq(lessons.id, swapLesson.id));

    revalidatePath("/admin");
    revalidatePath("/modules");
    revalidatePath("/admin/tree");
    return { success: true };
  } catch (error) {
    logger.error("Error reordering lesson:", getErrorMessage(error));
    throw new Error("Failed to reorder lesson: " + getErrorMessage(error));
  }
}

export async function addResource(lessonId: string, title: string, url: string, description?: string) {
  await requireAdmin();
  lessonId = parseUuid(lessonId, "lessonId");
  title = parseText(title, 200, "title");
  url = parse(urlSchema, url);
  if (description) description = parse(text(2000), description);
  try {
    const maxOrder = await db.select({ maxOrder: resources.displayOrder }).from(resources).where(eq(resources.lessonId, lessonId));
    const nextOrder = (maxOrder.length > 0 && maxOrder[0].maxOrder !== null) ? maxOrder[0].maxOrder + 1 : 0;
    const result = await db.insert(resources).values({
      lessonId,
      title,
      url,
      description: description || null,
      displayOrder: nextOrder,
    }).returning();
    revalidatePath("/admin/modules");
    return result[0];
  } catch (error) {
    logger.error("Error adding resource:", getErrorMessage(error));
    throw new Error("Failed to add resource: " + getErrorMessage(error));
  }
}

export async function deleteResource(id: string) {
  await requireAdmin();
  id = parseUuid(id, "resourceId");
  try {
    await db.delete(resources).where(eq(resources.id, id));
    revalidatePath("/admin/modules");
  } catch (error) {
    logger.error("Error deleting resource:", getErrorMessage(error));
    throw new Error("Failed to delete resource: " + getErrorMessage(error));
  }
}

export async function updateModuleWrapUpVideo(moduleId: string, wrapUpVideoUrl: string) {
  await requireAdmin();
  moduleId = parseUuid(moduleId, "moduleId");
  wrapUpVideoUrl = parse(urlSchema, wrapUpVideoUrl);
  try {
    await db.update(modules).set({ wrapUpVideoUrl }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/modules");
  } catch (error) {
    logger.error("Error updating module wrap-up video:", getErrorMessage(error));
    throw new Error("Failed to update module wrap-up video: " + getErrorMessage(error));
  }
}

export async function toggleModuleVisibility(moduleId: string) {
  await requireAdmin();
  moduleId = parseUuid(moduleId, "moduleId");
  try {
    const mod = await db.select({ isPublished: modules.isPublished }).from(modules).where(eq(modules.id, moduleId)).limit(1);
    if (mod.length === 0) throw new Error("Module not found");
    const newValue = !mod[0].isPublished;
    await db.update(modules).set({ isPublished: newValue }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/modules");
    return { success: true, isPublished: newValue };
  } catch (error) {
    logger.error("Error toggling module visibility:", getErrorMessage(error));
    throw new Error("Failed to toggle module visibility: " + getErrorMessage(error));
  }
}

export async function publishAllLessons() {
  await requireAdmin();
  try {
    await db.update(lessons).set({ isPublished: true });
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/modules");
    return { success: true };
  } catch (error) {
    logger.error("Error publishing all lessons:", getErrorMessage(error));
    throw new Error("Failed to publish all lessons: " + getErrorMessage(error));
  }
}

export async function fixCourseStructure() {
  await requireAdmin();
  try {
    // Get all levels in order
    const allLevels = await db.select().from(levels).orderBy(levels.displayOrder);
    // Get all modules ordered by level then displayOrder
    const allMods = await db.select().from(modules).orderBy(modules.displayOrder);

    let globalNum = 0;

    for (const lvl of allLevels) {
      const lvlMods = allMods.filter(m => m.levelId === lvl.id)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      for (let i = 0; i < lvlMods.length; i++) {
        globalNum++;

        // Fix displayOrder to be sequential within level
        const correctDisplayOrder = i + 1;
        if ((lvlMods[i].displayOrder ?? 0) !== correctDisplayOrder) {
          await db.update(modules)
            .set({ displayOrder: correctDisplayOrder })
            .where(eq(modules.id, lvlMods[i].id));
        }

        // Fix title to match global sequential number
        const oldTitle = lvlMods[i].title;
        const titleBody = oldTitle.includes(": ")
          ? oldTitle.split(": ").slice(1).join(": ")
          : oldTitle;
        const newTitle = `Module ${globalNum}: ${titleBody}`;
        if (newTitle !== oldTitle) {
          await db.update(modules)
            .set({ title: newTitle })
            .where(eq(modules.id, lvlMods[i].id));
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/modules");
    return { success: true };
  } catch (error) {
    logger.error("Error fixing course structure:", getErrorMessage(error));
    throw new Error("Failed to fix course structure: " + getErrorMessage(error));
  }
}

export async function stripModuleNumberPrefixes() {
  await requireAdmin();
  try {
    const allMods = await db.select().from(modules);
    let updated = 0;
    for (const mod of allMods) {
      const stripped = mod.title.replace(/^Module \d+: /, "");
      if (stripped !== mod.title) {
        await db.update(modules)
          .set({ title: stripped })
          .where(eq(modules.id, mod.id));
        updated++;
      }
    }
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/modules");
    return { success: true, updated };
  } catch (error) {
    logger.error("Error stripping prefixes:", getErrorMessage(error));
    throw new Error("Failed to strip prefixes: " + getErrorMessage(error));
  }
}

// --- One-off content tidy (25 Sep 2026 launch plan, merges M1–M4) ---
// Idempotent: each step checks the source lesson still exists, so running it
// twice is harmless. Run via POST /api/admin { "action": "mergeDuplicates" }.
export async function mergeDuplicateLessons() {
  await requireAdmin();
  const log: string[] = [];

  const findLesson = async (moduleSlug: string, lessonSlug: string) => {
    const [mod] = await db.select().from(modules).where(eq(modules.slug, moduleSlug));
    if (!mod) return null;
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.moduleId, mod.id), eq(lessons.slug, lessonSlug)));
    return lesson ? { mod, lesson } : null;
  };

  const removeLesson = async (lessonId: string) => {
    await db.delete(progress).where(eq(progress.lessonId, lessonId));
    await db.delete(lessons).where(eq(lessons.id, lessonId)); // resources cascade
  };

  // Append only the paragraphs the target doesn't already contain.
  const appendUnique = (target: string, addition: string, heading: string) => {
    const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    const have = norm(target);
    const paras = addition.split(/\n\s*\n/).filter((p) => p.trim() && !have.includes(norm(p)));
    if (paras.length === 0) return target;
    return `${target.trimEnd()}\n\n### ${heading}\n\n${paras.join("\n\n")}`;
  };

  const renumber = async (moduleId: string) => {
    const rows = await db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).orderBy(asc(lessons.displayOrder));
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].displayOrder !== i + 1) {
        await db.update(lessons).set({ displayOrder: i + 1 }).where(eq(lessons.id, rows[i].id));
      }
    }
  };

  // M1: "Fermata, Caesura & Tempo Terms" is a word-for-word copy of
  // "Fermata, Dal Segno & Musical Road Signs" (which has the video).
  const m1 = await findLesson("basic-music-terminology", "fermata-caesura-tempo-terms");
  const m1Keep = await findLesson("basic-music-terminology", "fermata-dal-segno-musical-road-signs");
  if (m1 && m1Keep) {
    if ((m1.lesson.notes || "").trim() !== (m1Keep.lesson.notes || "").trim()) {
      await db.update(lessons)
        .set({ notes: appendUnique(m1Keep.lesson.notes || "", m1.lesson.notes || "", "Caesura & tempo terms") })
        .where(eq(lessons.id, m1Keep.lesson.id));
    }
    await removeLesson(m1.lesson.id);
    log.push("M1: removed duplicate 'Fermata, Caesura & Tempo Terms'");
  }

  // M2: the two back-phrasing lessons are identical; keep the one with
  // resources, fix the spelling (colla voce).
  const m2 = await findLesson("basic-music-terminology", "colle-voce-back-phrasing-tacet");
  const m2Keep = await findLesson("basic-music-terminology", "back-phrasing-tacet-critical-terms-for-auditions");
  if (m2Keep) {
    await db.update(lessons)
      .set({
        title: "Colla Voce, Back Phrasing & Tacet",
        notes: (m2Keep.lesson.notes || "").replace(/Colle Voce/g, "Colla Voce"),
      })
      .where(eq(lessons.id, m2Keep.lesson.id));
    if (m2) {
      await removeLesson(m2.lesson.id);
      log.push("M2: removed duplicate 'Colle Voce, Back Phrasing & Tacet'; renamed to 'Colla Voce, Back Phrasing & Tacet'");
    }
    await renumber(m2Keep.mod.id);
  }

  // M3: 10.3 "Delivering Tempo & Introductions" is really about intros —
  // fold its unique sections into 10.5 (skipping its duplicate bell-tone timing).
  const MOD10 = "approaching-and-talking-to-your-accompanist";
  const m3 = await findLesson(MOD10, "delivering-tempo-introductions");
  const m3Keep = await findLesson(MOD10, "choosing-and-communicating-your-intro-bell-tones-chords-tacet");
  if (m3 && m3Keep) {
    const src = m3.lesson.notes || "";
    const cut = src.search(/^Bell Tone Timing/m);
    const addition = cut > -1 ? src.slice(0, cut) : src;
    await db.update(lessons)
      .set({
        title: "Your Intro: Bell Tones, Chords, Tacet & Starting on the Vocal",
        notes: appendUnique(m3Keep.lesson.notes || "", addition, "Intro length, repeat bars and \"lead us in\""),
      })
      .where(eq(lessons.id, m3Keep.lesson.id));
    await removeLesson(m3.lesson.id);
    log.push("M3: merged 'Delivering Tempo & Introductions' into the intro lesson");
  }

  // M4: 10.4 "Putting Things Down & Second Songs" — putting things down is
  // already in 10.2; move the second-song section across.
  const m4 = await findLesson(MOD10, "putting-things-down-second-songs");
  const m4Keep = await findLesson(MOD10, "how-to-approach-walk-them-through-the-music");
  if (m4 && m4Keep) {
    const src = m4.lesson.notes || "";
    const start = src.search(/^If They Ask for a Second Song/m);
    const addition = start > -1 ? src.slice(start).replace(/^If They Ask for a Second Song:?\s*\n/, "") : src;
    await db.update(lessons)
      .set({ notes: appendUnique(m4Keep.lesson.notes || "", addition, "If they ask for a second song") })
      .where(eq(lessons.id, m4Keep.lesson.id));
    await removeLesson(m4.lesson.id);
    log.push("M4: merged 'Putting Things Down & Second Songs' into the walk-through lesson");
  }
  if (m3Keep) await renumber(m3Keep.mod.id);
  if (m1Keep) await renumber(m1Keep.mod.id);

  revalidatePath("/modules");
  revalidatePath("/admin");
  return { log: log.length ? log : ["Nothing to do — merges already applied"] };
}
