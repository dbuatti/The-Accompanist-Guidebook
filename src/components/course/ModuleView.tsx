"use client";

import Link from "next/link";
import { Layers, FileText, CheckCircle2, ChevronRight, EyeOff, PlayCircle } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { formatModuleTitle } from "@/lib/utils";
import { useCourse } from "./CourseProvider";

export default function ModuleView({ moduleId }: { moduleId: string }) {
  const { getModule, isLessonCompleted, session } = useCourse();
  const module = getModule(moduleId);

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

  return (
    <div>
      {/* Hero header */}
      <div className="relative border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-primary/[0.02] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-10 pt-10 sm:pt-14 pb-8 sm:pb-10">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-5 sm:h-6 px-2.5 sm:px-3 rounded-full bg-primary/10 flex items-center gap-1.5">
              <Layers className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-primary" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">Module</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-primary leading-tight">{formatModuleTitle(module)}</h1>

          {/* Module progress */}
          {isLoggedIn && lessons.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{done}/{lessons.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <div className="max-w-4xl mx-auto px-5 sm:px-10 py-10 sm:py-12">
        <div className="space-y-3">
          {lessons.map((lesson: any, i: number) => (
            <Link
              key={lesson.id}
              href={`/modules/${module.id}/${lesson.id}`}
              className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-border/20 bg-card/40 hover:bg-card/60 hover:border-primary/15 transition-all duration-200"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                isLessonCompleted(lesson.id) ? "bg-accent/20 border-accent/30" : "bg-primary/8 border-primary/10"
              }`}>
                {isLessonCompleted(lesson.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-accent-foreground/80" />
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-primary/70">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-serif font-semibold text-primary group-hover:text-primary/80 transition-colors leading-snug">
                  {lesson.title}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  {lesson.duration && <span className="text-xs text-muted-foreground/60">{lesson.duration}</span>}
                  {lesson.videoUrl && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
                      <PlayCircle className="w-3 h-3" /> Video
                    </span>
                  )}
                  {lesson.resources && lesson.resources.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
                      <FileText className="w-3 h-3" /> {lesson.resources.length} resource{lesson.resources.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>

        {/* Wrap-Up Video */}
        {module.wrapUpVideoUrl && (
          <div className="mt-16">
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
    </div>
  );
}
