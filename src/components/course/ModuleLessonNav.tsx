"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useCourse } from "./CourseProvider";
import { formatModuleTitle } from "@/lib/utils";

export default function ModuleLessonNav({ moduleSlug, currentLessonSlug }: { moduleSlug: string; currentLessonSlug?: string }) {
  const { getModule, isLessonCompleted } = useCourse();
  const module = getModule(moduleSlug);
  if (!module) return null;

  const lessons = module.lessons || [];
  const done = lessons.filter((l) => isLessonCompleted(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border/20 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Module</p>
        <h2 className="text-sm font-serif font-bold text-primary mt-1 leading-snug">{formatModuleTitle(module)}</h2>
        {lessons.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground shrink-0">{done}/{lessons.length}</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {lessons.map((lesson, i) => {
          const isActive = lesson.slug === currentLessonSlug;
          const completed = isLessonCompleted(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/modules/${moduleSlug}/${lesson.slug}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent/15 text-foreground/75"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : completed
                    ? "bg-accent/20 text-accent-foreground"
                    : "bg-primary/[0.06] text-primary/50"
                }`}
              >
                {completed ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </span>
              <span className="text-sm truncate flex-1 min-w-0">{lesson.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
