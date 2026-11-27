"use client";

import Link from "next/link";
import { Layers, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { formatModuleTitle } from "@/lib/utils";
import { useCourse } from "./CourseProvider";
import { CTAButton } from "@/components/CTAButton";
import { showSuccess } from "@/utils/toast";

export default function ModuleView({ moduleSlug }: { moduleSlug: string }) {
  const { getModule, isLessonCompleted, session, content } = useCourse();
  const module = getModule(moduleSlug);

  const lessons = module?.lessons || [];
  const done = lessons.filter((l) => isLessonCompleted(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
  const isLoggedIn = !!session;
  const isComplete = lessons.length > 0 && done === lessons.length;
  const nextLesson = lessons.find((l) => !isLessonCompleted(l.id)) || lessons[0];

  // Find next module (first lesson of next module in the same level)
  const nextModule = (() => {
    if (!module?.levelId) return null;
    const level = content?.find((lvl) => lvl.id === module.levelId);
    if (!level) return null;
    const modIdx = level.modules.findIndex((m) => m.id === module.id);
    if (modIdx === -1 || modIdx === level.modules.length - 1) return null;
    const nextMod = level.modules[modIdx + 1];
    if (!nextMod || !nextMod.isPublished) return null;
    return nextMod;
  })();

  // Show toast when module completes
  useEffect(() => {
    if (module && module.isPublished && isComplete && isLoggedIn) {
      showSuccess("Module complete! Great work.");
    }
  }, [module, isComplete, isLoggedIn]);

  if (!module) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12">
        <Layers className="w-20 h-20 mb-6 opacity-15" />
        <p className="text-xl font-serif">Module not found</p>
        <p className="text-sm mt-2 text-muted-foreground/60">It may have been unpublished or moved.</p>
        <Link href="/modules" className="mt-6 text-primary text-sm hover:underline">Back to all modules</Link>
      </div>
    );
  }

  if (!module.isPublished) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <EyeOff className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-serif font-semibold text-foreground/60 mb-2">{formatModuleTitle(module)}</h2>
        <p className="text-sm text-muted-foreground/50 max-w-md text-center">This module is coming soon. Check back later for lessons and resources.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero header */}
      <div className="relative border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-primary/[0.02] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-1.5 h-5 sm:h-6 px-2.5 sm:px-3 rounded-full bg-primary/10 mb-3">
            <Layers className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-primary" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary leading-tight">{formatModuleTitle(module)}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground/60 mt-2">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</p>

          {isLoggedIn && lessons.length > 0 && (
            <div className="mt-4 flex items-center gap-3 max-w-xs">
              <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">{done}/{lessons.length}</span>
            </div>
          )}

          {lessons.length > 0 && (
            <div className="mt-5">
              <CTAButton href={`/modules/${module.slug}/${nextLesson.slug}`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : null}
                {isComplete ? "Review Lesson 1" : done > 0 ? `Continue: ${nextLesson.title}` : "Start Lesson 1"}
              </CTAButton>
            </div>
          )}
          {isLoggedIn && isComplete && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent-foreground px-3 py-1.5 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Module complete — nice work
              </span>
              {nextModule && nextModule.lessons[0] && (
                <Link
                  href={`/modules/${nextModule.slug}/${nextModule.lessons[0].slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Go to next module <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lesson list */}
      {lessons.length > 0 && (
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6 sm:py-8">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Lessons in this module</h3>
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const lessonDone = isLessonCompleted(lesson.id);
              const isCurrent = lesson.id === (lessons.find((l) => !isLessonCompleted(l.id))?.id || lessons[0]?.id);
              return (
                <Link
                  key={lesson.id}
                  href={`/modules/${module.slug}/${lesson.slug}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:border-primary/20 hover:bg-card ${
                    lessonDone
                      ? "border-border/30 bg-card/50 opacity-70"
                      : isCurrent
                        ? "border-primary/25 bg-primary/[0.04] ring-1 ring-primary/10"
                        : "border-border/30 bg-card/70"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    lessonDone ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    {lessonDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className="text-sm text-foreground/80 flex-1 min-w-0 truncate">{lesson.title}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 shrink-0">
                    {lessonDone ? "Done" : isCurrent ? "Next up" : "Not started"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Wrap-Up Video */}
      {module.wrapUpVideoUrl && (
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-primary/30" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Wrap-Up</h3>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-black/5">
            <VideoPlayer url={module.wrapUpVideoUrl} onComplete={() => {}} initialTime={0} onProgress={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
}