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
