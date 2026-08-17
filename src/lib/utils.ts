import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatModuleTitle(module: { title: string; moduleNumber?: number }): string {
  const title = module.title.replace(/^Module \d+: /, "");
  if (module.moduleNumber) {
    return `Module ${module.moduleNumber}: ${title}`;
  }
  return title;
}

export function slugify(input: string): string {
  return input
    .replace(/^Module \d+:\s*/i, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

export type MarkdownBlockType =
  | "heading"
  | "paragraph"
  | "bullet_list"
  | "numbered_list"
  | "callout"
  | "quote"
  | "divider";

export interface MarkdownBlock {
  type: MarkdownBlockType;
  content: string;
  order?: number;
}

export function parseMarkdownToBlocks(notes: string): MarkdownBlock[] {
  const lines = notes.split("\n");
  const blocks: MarkdownBlock[] = [];
  let listCounter = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { listCounter = 0; continue; }
    if (t.startsWith("### ")) { listCounter = 0; blocks.push({ type: "heading", content: t.replace("### ", "") }); }
    else if (t.startsWith("## ")) { listCounter = 0; blocks.push({ type: "heading", content: t.replace("## ", "") }); }
    else if (t.startsWith("# ")) { listCounter = 0; blocks.push({ type: "heading", content: t.replace("# ", "") }); }
    else if (t.startsWith("- ") || t.startsWith("* ")) { listCounter = 0; blocks.push({ type: "bullet_list", content: t.replace(/^[-*] /, "") }); }
    else if (/^\d+\.\s/.test(t)) { listCounter++; blocks.push({ type: "numbered_list", content: t.replace(/^\d+\.\s/, ""), order: listCounter }); }
    else if (t.startsWith("> [!tip] ")) { listCounter = 0; blocks.push({ type: "callout", content: t.replace("> [!tip] ", "") }); }
    else if (t.startsWith("> ")) { listCounter = 0; blocks.push({ type: "quote", content: t.replace("> ", "") }); }
    else if (t === "---") { listCounter = 0; blocks.push({ type: "divider", content: "" }); }
    else { listCounter = 0; blocks.push({ type: "paragraph", content: t }); }
  }
  return blocks;
}
