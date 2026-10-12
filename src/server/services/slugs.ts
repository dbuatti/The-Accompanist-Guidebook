import { db } from "@/lib/db";
import { modules, lessons } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";

export function dedupeSlug(base: string, taken: Set<string>): string {
  let candidate = base;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${n}`;
    n++;
  }
  taken.add(candidate);
  return candidate;
}

export async function uniqueModuleSlug(title: string): Promise<string> {
  const existing = await db.select({ slug: modules.slug }).from(modules);
  return dedupeSlug(slugify(title), new Set(existing.map((m) => m.slug)));
}

export async function uniqueLessonSlug(moduleId: string, title: string): Promise<string> {
  const existing = await db.select({ slug: lessons.slug }).from(lessons).where(eq(lessons.moduleId, moduleId));
  return dedupeSlug(slugify(title), new Set(existing.map((l) => l.slug)));
}
