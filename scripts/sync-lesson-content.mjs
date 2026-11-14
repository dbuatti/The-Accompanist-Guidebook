import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

const mods = await sql.query(`
  SELECT m.id, m.title, m.slug, m.display_order
  FROM modules m
  ORDER BY m.display_order, m.title
`);

const les = await sql.query(`
  SELECT l.module_id, l.title, l.notes, l.admin_notes, l.display_order
  FROM lessons l
  ORDER BY l.module_id, l.display_order
`);

const esc = (s) => {
  if (s === null || s === undefined) return '""';
  const str = String(s);
  // Escape backslashes first, then double quotes, then newlines/tabs
  return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}"`;
};

let out = `export interface LessonContentEntry {
  moduleTitle: string;
  lessons: {
    title: string;
    notes: string;
    adminNotes: string;
  }[];
}

// AUTO-GENERATED from DB on ${new Date().toISOString().slice(0, 10)}.
// Source of truth for scaffoldAuditionGuidebook() / syncLessonContent().
// Do not hand-edit individual lines; edit via /admin then re-run:
//   node scripts/sync-lesson-content.mjs
export const lessonContent: LessonContentEntry[] = [
`;

for (const m of mods) {
  out += `  {\n`;
  out += `    moduleTitle: ${esc(m.title)},\n`;
  out += `    lessons: [\n`;
  const lessons = les.filter((l) => l.module_id === m.id);
  for (const l of lessons) {
    out += `      {\n`;
    out += `        title: ${esc(l.title)},\n`;
    out += `        notes: ${esc(l.notes)},\n`;
    out += `        adminNotes: ${esc(l.admin_notes)},\n`;
    out += `      },\n`;
  }
  out += `    ],\n`;
  out += `  },\n`;
}

out += `];\n`;

fs.writeFileSync("src/app/actions/lessonContent.ts", out);
console.log("Wrote", mods.length, "modules,", les.length, "lessons to src/app/actions/lessonContent.ts");
process.exit(0);
