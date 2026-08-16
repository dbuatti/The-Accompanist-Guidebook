"use client";

import Link from "next/link";
import { Layers, FileText, CheckCircle2, ArrowRight, EyeOff } from "lucide-react";
import { formatModuleTitle } from "@/lib/utils";
import { useCourse } from "./CourseProvider";

const LEVEL_ACCENTS = [
  { badgeBg: "bg-primary/10", badgeText: "text-primary", label: "text-primary/50", numBg: "bg-primary/[0.06]", numText: "text-primary/50" },
  { badgeBg: "bg-indigo-400/10", badgeText: "text-indigo-600", label: "text-indigo-500/50", numBg: "bg-indigo-400/[0.06]", numText: "text-indigo-600/50" },
  { badgeBg: "bg-blue-400/10", badgeText: "text-blue-600", label: "text-blue-500/50", numBg: "bg-blue-400/[0.06]", numText: "text-blue-600/50" },
];

export default function CurriculumView() {
  const { content, isLessonCompleted, session } = useCourse();
  const isLoggedIn = !!session;

  const totalModules = content.reduce((sum: number, lvl: any) => sum + lvl.modules.length, 0);
  const totalLessons = content.reduce((sum: number, lvl: any) => sum + lvl.modules.reduce((s: number, mod: any) => s + mod.lessons.length, 0), 0);

  const continueLesson = (() => {
    if (!isLoggedIn) return null;
    for (const level of content) {
      for (const mod of level.modules || []) {
        for (const lesson of mod.lessons || []) {
          if (!isLessonCompleted(lesson.id)) {
            return { href: `/modules/${mod.slug}/${lesson.slug}`, title: lesson.title, moduleTitle: formatModuleTitle(mod) };
          }
        }
      }
    }
    return null;
  })();
  const hasStarted = isLoggedIn && content.some((lvl: any) => lvl.modules.some((mod: any) => mod.lessons.some((l: any) => isLessonCompleted(l.id))));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="relative border-b border-border/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-primary/[0.02] to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-10 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
          <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-5 ring-1 ring-primary/10">
            <Layers className="w-6 sm:w-7 h-6 sm:h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-primary leading-tight mb-2 sm:mb-3">
            Course Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground/60">
            {totalModules} modules spanning {totalLessons} lessons
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-10 pt-8 sm:pt-10">
        {hasStarted && continueLesson && (
          <Link
            href={continueLesson.href}
            className="group flex items-center gap-4 rounded-2xl border border-accent/25 bg-accent/[0.07] hover:bg-accent/[0.1] transition-colors p-5 mb-2"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-bright">Continue learning</span>
              <p className="text-base font-serif font-semibold text-primary mt-1 truncate">{continueLesson.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{continueLesson.moduleTitle}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-accent-bright shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-10 pb-10 sm:pb-14 pt-8 sm:pt-4 space-y-12 sm:space-y-14">
        {content.map((level: any, li: number) => {
          const accent = LEVEL_ACCENTS[li % LEVEL_ACCENTS.length];
          return (
          <section key={level.id}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent.badgeBg}`}>
                <span className={`text-xs font-bold ${accent.badgeText}`}>{li + 1}</span>
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accent.label}`}>
                  Level {li + 1}
                </span>
                <h2 className="text-xl font-serif font-bold text-primary -mt-0.5">{level.title}</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent ml-auto max-w-[120px]" />
            </div>

            <div className="space-y-5">
              {level.modules.map((mod: any) => {
                const isHidden = mod.isPublished === false;
                return (
                  <div key={mod.id} className="border border-border/20 rounded-2xl bg-card/40 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/10">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent.numBg}`}>
                        <span className={`text-xs font-bold tabular-nums ${accent.numText}`}>
                          {String(mod.moduleNumber ?? "").padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className={`text-base font-serif font-semibold flex-1 min-w-0 truncate ${isHidden ? "text-muted-foreground/60 italic" : "text-primary"}`}>
                        {formatModuleTitle(mod)}
                      </h3>
                      {isHidden ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 shrink-0">
                          <EyeOff className="w-3 h-3" /> Coming soon
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 flex items-center gap-1 shrink-0">
                          <FileText className="w-3 h-3" /> {mod.lessons.length}
                        </span>
                      )}
                    </div>

                    {!isHidden && mod.lessons.length > 0 && (
                      <div className="py-1">
                        {mod.lessons.map((lesson: any, i: number) => {
                          const done = isLoggedIn && isLessonCompleted(lesson.id);
                          return (
                            <Link
                              key={lesson.id}
                              href={`/modules/${mod.slug}/${lesson.slug}`}
                              className="group flex items-center gap-3 px-5 py-2.5 hover:bg-accent/10 transition-colors"
                            >
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${done ? "bg-accent/20 text-accent-foreground" : `${accent.numBg} ${accent.numText}`}`}>
                                {done ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                              </span>
                              <span className="text-sm text-foreground/70 group-hover:text-primary transition-colors truncate flex-1 min-w-0">
                                {lesson.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )})}
      </div>
    </div>
  );
}
