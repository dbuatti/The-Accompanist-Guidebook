import { db } from "@/lib/db";
import { levels, modules, lessons, resources } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { youtubeDurationFor, youtubeId } from "./youtube";

export type HealthFlag =
  | "no_video"
  | "video_not_uploaded"
  | "thin_notes"
  | "no_cliffnotes"
  | "no_resources"
  | "draft"
  | "placeholder_duration";

export interface LessonHealth {
  id: string;
  title: string;
  slug: string;
  moduleId: string;
  moduleTitle: string;
  moduleSlug: string;
  levelTitle: string;
  isPublished: boolean;
  hasVideo: boolean;
  videoStatus: string;
  videoUrl: string;
  duration: string;
  noteWords: number;
  resourceCount: number;
  flags: HealthFlag[];
  score: number; // 0–100, higher = more complete
}

const FLAG_WEIGHT: Record<HealthFlag, number> = {
  no_video: 30,
  video_not_uploaded: 10,
  thin_notes: 25,
  no_cliffnotes: 10,
  no_resources: 5,
  draft: 15,
  placeholder_duration: 5,
};

function wordCount(text: string | null): number {
  if (!text) return 0;
  return text.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

export async function getContentHealth(): Promise<LessonHealth[]> {
  await requireAdmin();
  const [allLevels, allModules, allLessons, allResources] = await Promise.all([
    db.select().from(levels).orderBy(asc(levels.displayOrder)),
    db.select().from(modules).orderBy(asc(modules.displayOrder)),
    db.select().from(lessons).orderBy(asc(lessons.displayOrder)),
    db.select({ lessonId: resources.lessonId }).from(resources),
  ]);
  const resourceCount = new Map<string, number>();
  for (const r of allResources) resourceCount.set(r.lessonId, (resourceCount.get(r.lessonId) ?? 0) + 1);
  const levelTitle = new Map(allLevels.map((l) => [l.id, l.title]));
  const levelOrder = new Map(allLevels.map((l, i) => [l.id, i]));
  const sortedModules = [...allModules].sort(
    (a, b) => (levelOrder.get(a.levelId ?? "") ?? 0) - (levelOrder.get(b.levelId ?? "") ?? 0) || a.displayOrder - b.displayOrder,
  );

  const out: LessonHealth[] = [];
  for (const mod of sortedModules) {
    for (const l of allLessons.filter((x) => x.moduleId === mod.id)) {
      const noteWords = wordCount(l.notes);
      const rc = resourceCount.get(l.id) ?? 0;
      const hasUrl = !!youtubeId(l.videoUrl) || /^https?:\/\//.test(l.videoUrl || "");
      const flags: HealthFlag[] = [];
      if (l.hasVideo && !hasUrl) flags.push("no_video");
      if (l.hasVideo && hasUrl && l.videoStatus !== "uploaded") flags.push("video_not_uploaded");
      if (noteWords < 100) flags.push("thin_notes");
      if (!l.cliffnotes?.trim()) flags.push("no_cliffnotes");
      if (rc === 0) flags.push("no_resources");
      if (!l.isPublished) flags.push("draft");
      if (l.hasVideo && hasUrl && (!l.duration || l.duration === "05:00")) flags.push("placeholder_duration");
      const score = Math.max(0, 100 - flags.reduce((s, f) => s + FLAG_WEIGHT[f], 0));
      out.push({
        id: l.id,
        title: l.title,
        slug: l.slug,
        moduleId: mod.id,
        moduleTitle: mod.title,
        moduleSlug: mod.slug,
        levelTitle: levelTitle.get(mod.levelId ?? "") ?? "",
        isPublished: l.isPublished,
        hasVideo: l.hasVideo,
        videoStatus: l.videoStatus,
        videoUrl: l.videoUrl,
        duration: l.duration,
        noteWords,
        resourceCount: rc,
        flags,
        score,
      });
    }
  }
  return out;
}

export async function getYoutubeDuration(url: string): Promise<string | null> {
  await requireAdmin();
  return youtubeDurationFor(url);
}

/** Fill in every lesson's duration from its YouTube video. */
export async function syncYoutubeDurations(): Promise<{ updated: number; unchanged: number; failed: string[] }> {
  await requireAdmin();
  const rows = await db.select({ id: lessons.id, title: lessons.title, videoUrl: lessons.videoUrl, duration: lessons.duration }).from(lessons);
  const withVideo = rows.filter((r) => youtubeId(r.videoUrl));
  let updated = 0;
  let unchanged = 0;
  const failed: string[] = [];
  // A few at a time, so YouTube doesn't rate-limit us.
  for (let i = 0; i < withVideo.length; i += 4) {
    const batch = withVideo.slice(i, i + 4);
    const results = await Promise.all(batch.map((r) => youtubeDurationFor(r.videoUrl)));
    for (let j = 0; j < batch.length; j++) {
      const d = results[j];
      if (!d) failed.push(batch[j].title);
      else if (d === batch[j].duration) unchanged++;
      else {
        await db.update(lessons).set({ duration: d }).where(eq(lessons.id, batch[j].id));
        updated++;
      }
    }
  }
  revalidatePath("/admin");
  revalidatePath("/modules");
  return { updated, unchanged, failed };
}
