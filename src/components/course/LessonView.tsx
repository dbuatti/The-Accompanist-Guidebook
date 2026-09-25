"use client";

import Link from "next/link";
import { CheckCircle2, Link2, ExternalLink, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { MarkdownBody } from "@/components/MarkdownBody";
import { useCourse } from "./CourseProvider";
import { formatModuleTitle } from "@/lib/utils";
import { saveVideoProgress } from "@/app/actions";

export default function LessonView({ moduleSlug, lessonSlug }: { moduleSlug: string; lessonSlug: string }) {
  const { getModule, getLesson, getAdjacentLesson, isLessonCompleted, toggleComplete, session, progressData } = useCourse();
  const module = getModule(moduleSlug);
  const lesson = getLesson(moduleSlug, lessonSlug);
  const { prev, next } = getAdjacentLesson(moduleSlug, lessonSlug);

  if (!module || !lesson) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12">
        <BookOpen className="w-20 h-20 mb-6 opacity-15" />
        <p className="text-xl font-serif">Lesson not found</p>
        <p className="text-sm mt-2 text-muted-foreground/60">It may have been unpublished or moved.</p>
        <Link href="/modules" className="mt-6 text-primary text-sm hover:underline">Back to all modules</Link>
      </div>
    );
  }

  const isLoggedIn = !!session;
  const completed = isLessonCompleted(lesson.id);
  const lessons = module.lessons || [];
  const lessonIndex = lessons.findIndex((l) => l.id === lesson.id);
  const moduleDone = lessons.filter((l) => isLessonCompleted(l.id)).length;
  const modulePct = lessons.length > 0 ? Math.round((moduleDone / lessons.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="relative border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-primary/[0.02] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-10 pt-8 sm:pt-12 pb-6 sm:pb-8">
          <div className="flex items-center gap-1.5 mb-3 text-[11px] text-muted-foreground">
            <Link
              href={`/modules/${module.slug}`}
              className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none rounded-sm"
            >
              {formatModuleTitle(module)}
            </Link>
            <span className="text-muted-foreground/40">·</span>
            <span>
              Lesson {lessonIndex + 1} of {lessons.length}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-primary leading-tight">{lesson.title}</h1>

          {isLoggedIn && lessons.length > 0 && (
            <div className="mt-5 flex items-center gap-2.5 max-w-sm">
              <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${modulePct}%` }} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground shrink-0 tabular-nums">
                {moduleDone}/{lessons.length} in module
              </span>
            </div>
          )}

          {isLoggedIn && (
            <button
              onClick={() => toggleComplete(lesson.id)}
              aria-pressed={completed}
              title={completed ? "Mark this lesson as not complete" : "Mark this lesson as complete"}
              className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
                completed
                  ? "bg-accent/20 border-accent/30 text-accent-foreground hover:bg-accent/30"
                  : "bg-card/70 border-border text-foreground/75 hover:border-primary/30 hover:text-primary"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${completed ? "text-accent-bright" : "text-muted-foreground/60"}`} />
              {completed ? "Completed" : "Mark lesson complete"}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-5 sm:px-10 py-8 sm:py-12">
        {/* Video */}
        {lesson.videoUrl && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-black/5">
            <VideoPlayer
              url={lesson.videoUrl}
              onComplete={() => {
                if (!completed) toggleComplete(lesson.id);
              }}
              initialTime={progressData.find((p) => p.lessonId === lesson.id)?.lastPosition ?? 0}
              onProgress={(seconds) => {
                if (isLoggedIn) saveVideoProgress(lesson.id, seconds);
              }}
            />
          </div>
        )}

        {/* Notes */}
        <MarkdownBody markdown={lesson.notes || ""} />

        {/* Resources */}
        {lesson.resources && lesson.resources.length > 0 && (
          <div className="mt-10">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-4 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5" /> Resources
            </h3>
            <div className="grid gap-3">
              {lesson.resources.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-card/40 border border-border/20 rounded-2xl hover:bg-accent/5 hover:border-primary/15 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 border border-primary/10">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-primary group-hover:underline">{res.title}</span>
                    {res.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{res.description}</p>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Complete */}
        {isLoggedIn && !completed && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => toggleComplete(lesson.id)}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/15 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark lesson complete
            </button>
          </div>
        )}

        {/* Prev / Next */}
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={prev.href}
              className="group flex flex-col gap-1 p-5 rounded-2xl border border-border/20 bg-card/40 hover:border-primary/20 hover:bg-card/60 transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Previous lesson
              </span>
              <span className="text-[11px] text-muted-foreground/60 truncate">{prev.moduleTitle}</span>
              <span className="text-sm font-serif font-semibold text-primary group-hover:text-primary/80 transition-colors">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group sm:text-right flex flex-col gap-1 p-5 rounded-2xl border border-border/20 bg-card/40 hover:border-primary/20 hover:bg-card/60 transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1 sm:justify-end">
                Next lesson <ChevronRight className="w-3 h-3" />
              </span>
              <span className="text-[11px] text-muted-foreground/60 truncate">{next.moduleTitle}</span>
              <span className="text-sm font-serif font-semibold text-primary group-hover:text-primary/80 transition-colors">{next.title}</span>
            </Link>
          ) : (
            <div className="sm:text-right flex flex-col gap-1 p-5 rounded-2xl border border-primary/15 bg-primary/[0.04]">
              <span className="text-[10px] uppercase tracking-widest text-primary/50 flex items-center gap-1 sm:justify-end">
                Course complete <CheckCircle2 className="w-3 h-3" />
              </span>
              <span className="text-sm font-serif font-semibold text-primary">You&apos;ve reached the end!</span>
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[11px] text-muted-foreground/60 uppercase tracking-widest">End of lesson</p>
        </div>
      </div>
    </div>
  );
}
