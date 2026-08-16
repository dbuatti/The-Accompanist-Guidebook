"use client";

import Link from "next/link";
import { Layers, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { formatModuleTitle } from "@/lib/utils";
import { useCourse } from "./CourseProvider";

export default function ModuleView({ moduleSlug }: { moduleSlug: string }) {
  const { getModule, isLessonCompleted, session } = useCourse();
  const module = getModule(moduleSlug);

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

  const lessons = module.lessons || [];
  const done = lessons.filter((l: any) => isLessonCompleted(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
  const isLoggedIn = !!session;
  const isComplete = lessons.length > 0 && done === lessons.length;
  const nextLesson = lessons.find((l: any) => !isLessonCompleted(l.id)) || lessons[0];

  return (
    <div>
      {/* Hero header */}
      <div className="relative border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-primary/[0.02] to-transparent" />
        <div className="relative max-w-2xl mx-auto px-5 sm:px-10 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center">
          <div className="inline-flex items-center gap-1.5 h-5 sm:h-6 px-2.5 sm:px-3 rounded-full bg-primary/10 mb-4">
            <Layers className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-primary" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">Module</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-primary leading-tight">{formatModuleTitle(module)}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground/60 mt-3">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</p>

          {isLoggedIn && lessons.length > 0 && (
            <div className="mt-5 flex items-center gap-3 max-w-xs mx-auto">
              <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">{done}/{lessons.length}</span>
            </div>
          )}

          {lessons.length > 0 && (
            <Link
              href={`/modules/${module.slug}/${nextLesson.slug}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 mt-7"
            >
              {isComplete ? <CheckCircle2 className="w-4 h-4" /> : null}
              {isComplete ? "Review Lesson 1" : done > 0 ? `Continue: ${nextLesson.title}` : "Start Lesson 1"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Wrap-Up Video */}
      {module.wrapUpVideoUrl && (
        <div className="max-w-2xl mx-auto px-5 sm:px-10 py-10 sm:py-12">
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
