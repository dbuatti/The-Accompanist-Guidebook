"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Layers, LogOut, Settings, Shield } from "lucide-react";
import { useCourse } from "./CourseProvider";
import { formatLevelTitle, formatModuleTitle } from "@/lib/utils";

export default function CurriculumNav({
  moduleSlug,
  currentLessonSlug,
}: {
  moduleSlug?: string;
  currentLessonSlug?: string;
}) {
  const { content, isLessonCompleted, session, isAdmin, logout } = useCourse();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (moduleSlug) {
      setOpenModules((prev) => (prev[moduleSlug] ? prev : { ...prev, [moduleSlug]: true }));
    }
  }, [moduleSlug]);

  const toggleModule = (slug: string) => {
    setOpenModules((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 border-b border-border/20 shrink-0">
        <div className="flex items-center gap-2 text-primary">
          <Layers className="w-4 h-4" />
          <p className="text-[11px] font-bold uppercase tracking-[0.15em]">Course curriculum</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Jump to any module or lesson.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {content.map((level, levelIndex) => (
          <div key={level.id} className="space-y-1">
            <p className="px-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
              Level {levelIndex + 1} · {formatLevelTitle(level.title)}
            </p>
            <div className="space-y-1">
              {level.modules.map((module) => {
                const lessons = module.lessons || [];
                const done = lessons.filter((l) => isLessonCompleted(l.id)).length;
                const isCurrentModule = module.slug === moduleSlug;
                const isOpen = !!openModules[module.slug] || isCurrentModule;
                const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;

                return (
                  <div key={module.id} className="rounded-xl border border-border/30 bg-card/50 overflow-hidden">
                    <div className="flex items-start gap-1 p-1.5">
                      <button
                        type="button"
                        onClick={() => toggleModule(module.slug)}
                        className="mt-0.5 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/20 transition-colors shrink-0"
                        aria-label={isOpen ? `Collapse ${formatModuleTitle(module)}` : `Expand ${formatModuleTitle(module)}`}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0 flex-1 py-1 pr-1">
                        <Link
                          href={`/modules/${module.slug}`}
                          className={`block text-sm font-medium leading-snug truncate transition-colors ${
                            isCurrentModule ? "text-primary" : "text-foreground/80 hover:text-primary"
                          }`}
                          title={formatModuleTitle(module)}
                        >
                          {formatModuleTitle(module)}
                        </Link>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-primary/10 overflow-hidden">
                            <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground/70 tabular-nums shrink-0">
                            {done}/{lessons.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isOpen && lessons.length > 0 && (
                      <div className="px-2 pb-2 space-y-0.5">
                        {lessons.map((lesson, i) => {
                          const active = lesson.slug === currentLessonSlug && isCurrentModule;
                          const completed = isLessonCompleted(lesson.id);
                          return (
                            <Link
                              key={lesson.id}
                              href={`/modules/${module.slug}/${lesson.slug}`}
                              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-accent/15 text-foreground/75"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  active
                                    ? "bg-primary-foreground/15 text-primary-foreground"
                                    : completed
                                      ? "bg-accent/20 text-accent-foreground"
                                      : "bg-primary/[0.06] text-primary/50"
                                }`}
                              >
                                {completed ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                              </span>
                              <span className="truncate flex-1 min-w-0">{lesson.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {session && (
        <div className="border-t border-border/30 p-3 space-y-1 shrink-0 bg-muted/20">
          <Link
            href="/modules/resources"
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-accent/15 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Tools &amp; resources
          </Link>
          <Link
            href="/account/settings"
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-accent/15 transition-colors"
          >
            <Settings className="w-4 h-4" /> Account settings
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-accent/15 transition-colors"
            >
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
