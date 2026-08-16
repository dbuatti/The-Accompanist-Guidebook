// One-time migration: add + backfill `slug` on modules and lessons.
// Run with: node scripts/backfill-slugs.mjs
// Mirrors slugify() in src/lib/utils.ts.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function slugify(input) {
  return (
    input
      .replace(/^Module \d+:\s*/i, "")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "untitled"
  );
}

function dedupe(base, taken) {
  let candidate = base;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${n}`;
    n++;
  }
  taken.add(candidate);
  return candidate;
}

async function main() {
  await sql`ALTER TABLE modules ADD COLUMN IF NOT EXISTS slug text`;
  await sql`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS slug text`;
  console.log("Columns ensured.");

  const modules = await sql`SELECT id, title FROM modules ORDER BY created_at ASC`;
  const takenModuleSlugs = new Set();
  for (const mod of modules) {
    const slug = dedupe(slugify(mod.title), takenModuleSlugs);
    await sql`UPDATE modules SET slug = ${slug} WHERE id = ${mod.id}`;
  }
  console.log(`Backfilled ${modules.length} module slugs.`);

  const lessons = await sql`SELECT id, module_id, title FROM lessons ORDER BY created_at ASC`;
  const takenByModule = new Map();
  for (const lesson of lessons) {
    if (!takenByModule.has(lesson.module_id)) takenByModule.set(lesson.module_id, new Set());
    const slug = dedupe(slugify(lesson.title), takenByModule.get(lesson.module_id));
    await sql`UPDATE lessons SET slug = ${slug} WHERE id = ${lesson.id}`;
  }
  console.log(`Backfilled ${lessons.length} lesson slugs.`);

  const nullModuleSlugs = await sql`SELECT count(*)::int AS n FROM modules WHERE slug IS NULL OR slug = ''`;
  const nullLessonSlugs = await sql`SELECT count(*)::int AS n FROM lessons WHERE slug IS NULL OR slug = ''`;
  const dupeModuleSlugs = await sql`SELECT slug, count(*)::int AS n FROM modules GROUP BY slug HAVING count(*) > 1`;
  const dupeLessonSlugs = await sql`SELECT module_id, slug, count(*)::int AS n FROM lessons GROUP BY module_id, slug HAVING count(*) > 1`;

  console.log("Verification:", {
    nullModuleSlugs: nullModuleSlugs[0].n,
    nullLessonSlugs: nullLessonSlugs[0].n,
    dupeModuleSlugs,
    dupeLessonSlugs,
  });

  if (
    nullModuleSlugs[0].n > 0 ||
    nullLessonSlugs[0].n > 0 ||
    dupeModuleSlugs.length > 0 ||
    dupeLessonSlugs.length > 0
  ) {
    console.error("Verification failed — not applying constraints. Fix data before re-running.");
    process.exit(1);
  }

  await sql`ALTER TABLE modules ALTER COLUMN slug SET NOT NULL`;
  try {
    await sql`ALTER TABLE modules ADD CONSTRAINT modules_slug_key UNIQUE (slug)`;
  } catch (e) {
    if (!String(e.message).includes("already exists")) throw e;
  }
  await sql`ALTER TABLE lessons ALTER COLUMN slug SET NOT NULL`;
  try {
    await sql`ALTER TABLE lessons ADD CONSTRAINT lessons_module_id_slug_key UNIQUE (module_id, slug)`;
  } catch (e) {
    if (!String(e.message).includes("already exists")) throw e;
  }
  console.log("Constraints applied. Done.");
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
