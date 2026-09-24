import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { modules, lessons } from "@/lib/schema";
import { eq } from "drizzle-orm";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";
const today = new Date();

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/modules`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/guides`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/guides/how-many-songs-for-a-musical-theatre-audition`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/guides/how-to-cut-sheet-music-for-an-audition`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/guides/how-to-hand-over-your-music-to-the-audition-pianist`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/guides/what-to-bring-to-a-musical-theatre-audition`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/guides/the-48-hour-pre-audition-checklist`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const moduleRows = await db
      .select({ slug: modules.slug, updated: modules.createdAt })
      .from(modules)
      .where(eq(modules.isPublished, true));
    const lessonRows = await db
      .select({ moduleSlug: modules.slug, lessonSlug: lessons.slug })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(lessons.isPublished, true));

    for (const mod of moduleRows) {
      routes.push({
        url: `${BASE}/modules/${mod.slug}`,
        lastModified: today,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const lesson of lessonRows) {
      routes.push({
        url: `${BASE}/modules/${lesson.moduleSlug}/${lesson.lessonSlug}`,
        lastModified: today,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch (error) {
    console.error("Error building dynamic sitemap entries:", error);
  }

  return routes;
}