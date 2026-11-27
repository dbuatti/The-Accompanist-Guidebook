"use client";

import Link from "next/link";
import { FileText, CheckCircle2, ArrowRight, EyeOff, PartyPopper } from "lucide-react";
import { formatModuleTitle, formatLevelTitle } from "@/lib/utils";
import { useCourse } from "./CourseProvider";
import type { CourseLevel, CourseModule, CourseLesson } from "@/lib/types";

const LEVEL_ACCENTS = [
  { badgeBg: "bg-primary/10", badgeText: "text-primary", label: "text-primary/70", numBg: "bg-primary/[0.06]", numText: "text-primary/70" },
  { badgeBg: "bg-indigo-400/10", badgeText: "text-indigo-600", label: "text-indigo-500/70", numBg: "bg-indigo-400/[0.06]", numText: "text-indigo-600/70" },
  { badgeBg: "bg-blue-400/10", badgeText: "text-blue-600", label: "text-blue-500/70", numBg: "bg-blue-400/[0.06]", numText: "text-blue-600/70" },
];

export default function CurriculumView() {
  const { content, isLessonCompleted, session } = useCourse();
  const isLoggedIn = !!session;

  const totalModules = content.reduce((sum, lvl) => sum + lvl.modules.length, 0);
  const totalLessons = content.reduce((sum, lvl) => sum + lvl.modules.reduce((s, mod) => s + mod.lessons.length, 0), 0);

  const completedCount = isLoggedIn
    ? content.reduce(
        (sum, lvl) =>
          sum + lvl.modules.reduce((s, mod) => s + mod.lessons.filter((l) => isLessonCompleted(l.id)).length, 0),
        0,
      )
    : 0;
  const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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
  const hasStarted = isLoggedIn && content.some((lvl) => lvl.modules.some((mod) => mod.lessons.some((l) => isLessonCompleted(l.id))));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="border-b border-border/30">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary/70 mb-2">Your course</p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary leading-tight">Course Curriculum</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalModules} modules · {totalLessons} lessons
              </p>
            </div>
            {isLoggedIn && (
              <div className="sm:text-right shrink-0">
                <p className="text-sm font-medium text-primary">{overallPct}% complete</p>
                <p className="text-xs text-muted-foreground mt-0.5">{completedCount} of {totalLessons} lessons</p>
                <div className="mt-2 h-1.5 w-full sm:w-40 rounded-full bg-primary/10 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${overallPct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasStarted && totalLessons > 0 && (
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-6">
          {continueLesson ? (
            <Link
              href={continueLesson.href}
              className="group flex items-center gap-4 rounded-2xl border border-accent/25 bg-accent/[0.07] hover:bg-accent/[0.1] transition-colors p-4 sm:p-5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-bright">Continue learning</span>
                <p className="text-base font-serif font-semibold text-primary mt-1 truncate">{continueLesson.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{continueLesson.moduleTitle}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-accent-bright shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border border-accent/25 bg-accent/[0.07] p-4 sm:p-5">
                <div className="w-10 h-10 rounded-xl bg-accent-bright/10 flex items-center justify-center shrink-0">
                  <PartyPopper className="w-5 h-5 text-accent-bright" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-serif font-semibold text-primary">You&apos;ve completed the course</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Every lesson, done. Come back anytime to revisit a module or brush up before your next audition.
                  </p>
                </div>
                <Link
                  href="/welcome"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline shrink-0 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none rounded-sm"
                >
                  Welcome page <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <a
                href="https://pianobackings.danielebuatti.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card/60 hover:bg-card transition-colors p-4 sm:p-5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Next step</span>
                  <p className="text-base font-serif font-semibold text-primary mt-1">Practise your audition song with a real piano track</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    I&apos;ll record a custom backing of your cut, in your key, the way it&apos;ll be played in the room. Piano Backings by Daniele.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-5 sm:px-8 pb-10 sm:pb-14 pt-6 space-y-8">
        {content.map((level, li) => {
          const accent = LEVEL_ACCENTS[li % LEVEL_ACCENTS.length];
          return (
          <section key={level.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${accent.badgeBg}`}>
                <span className={`text-[11px] font-bold ${accent.badgeText}`}>{li + 1}</span>
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accent.label}`}>
                  Level {li + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-primary leading-tight">{formatLevelTitle(level.title)}</h2>
              </div>
            </div>

            <div className="space-y-3">
              {level.modules.map((mod) => {
                const isHidden = mod.isPublished === false;
                return (
                  <div key={mod.id} className="border border-border/30 rounded-2xl bg-card/70 overflow-hidden">
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
                        <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 shrink-0">
                          <EyeOff className="w-3 h-3" /> Coming soon
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 flex items-center gap-1 shrink-0">
                          <FileText className="w-3 h-3" /> {mod.lessons.length}
                        </span>
                      )}
                    </div>

                    {!isHidden && mod.lessons.length > 0 && (
                      <div className="py-1">
                        {mod.lessons.map((lesson, i) => {
                          const done = isLoggedIn && isLessonCompleted(lesson.id);
                          return (
                            <Link
                              key={lesson.id}
                              href={`/modules/${mod.slug}/${lesson.slug}`}
                              className="group flex items-center gap-3 px-5 py-2.5 hover:bg-accent/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none rounded"
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
