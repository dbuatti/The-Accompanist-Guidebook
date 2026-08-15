"use client";

import Link from "next/link";
import { Layers, FileText, ChevronRight } from "lucide-react";
import { formatModuleTitle } from "@/lib/utils";

export default function CurriculumView({ content }: { content: any[] }) {
  const totalModules = content.reduce((sum: number, lvl: any) => sum + lvl.modules.length, 0);
  const totalLessons = content.reduce((sum: number, lvl: any) => sum + lvl.modules.reduce((s: number, mod: any) => s + mod.lessons.length, 0), 0);

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
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-5 sm:mt-6 text-[10px] sm:text-[11px] text-muted-foreground/50 uppercase tracking-wider font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              Level 1: Foundations
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50" />
              Level 2: Preparation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
              Level 3: Collaboration
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-10 py-10 sm:py-14 space-y-12 sm:space-y-14">
        {content.map((level: any, li: number) => {
          return (
          <section key={level.id}>
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${li === 0 ? "bg-primary/10" : li === 1 ? "bg-indigo-400/10" : "bg-blue-400/10"}`}>
                <span className={`text-xs font-bold ${li === 0 ? "text-primary" : li === 1 ? "text-indigo-600" : "text-blue-600"}`}>
                  {li + 1}
                </span>
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${li === 0 ? "text-primary/50" : li === 1 ? "text-indigo-500/50" : "text-blue-500/50"}`}>
                  Level {li + 1}
                </span>
                <h2 className="text-xl font-serif font-bold text-primary -mt-0.5">{level.title}</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent ml-auto max-w-[120px]" />
            </div>

            <div className="grid gap-5">
              {level.modules.map((mod: any, mi: number) => {
                const modNum = content.slice(0, li).reduce((s: number, l: any) => s + l.modules.length, 0) + mi + 1;
                return (
                <div key={mod.id} className="group relative">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative border border-border/20 rounded-2xl bg-card/40 hover:bg-card/60 hover:border-primary/15 hover:shadow-md hover:shadow-primary/[0.02] transition-all duration-200">
                    <Link
                      href={`/modules/${mod.id}`}
                      className="flex items-center gap-4 w-full text-left p-5"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${li === 0 ? "bg-primary/[0.06] border-primary/10" : li === 1 ? "bg-indigo-400/[0.06] border-indigo-400/10" : "bg-blue-400/[0.06] border-blue-400/10"}`}>
                        <span className={`text-sm font-bold ${li === 0 ? "text-primary/60" : li === 1 ? "text-indigo-600/60" : "text-blue-600/60"}`}>
                          {String(modNum).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-serif font-semibold text-primary group-hover:text-primary/80 transition-colors">
                          {formatModuleTitle(mod)}
                        </h3>
                        <p className="text-xs text-muted-foreground/50 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                          </span>
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full border border-border/30 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shrink-0">
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                      </div>
                    </Link>

                    {mod.lessons.length > 0 && (
                      <div className="border-t border-border/10 mx-5 pb-2">
                        {mod.lessons.map((lesson: any, i: number) => (
                          <Link
                            key={lesson.id}
                            href={`/modules/${mod.id}/${lesson.id}`}
                            className="flex items-center gap-3 w-full text-left py-2.5 px-2 hover:bg-accent/10 rounded-lg transition-colors group/lesson"
                          >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${li === 0 ? "bg-primary/[0.04] text-primary/40" : li === 1 ? "bg-indigo-400/[0.04] text-indigo-600/40" : "bg-blue-400/[0.04] text-blue-600/40"}`}>
                              {i + 1}
                            </span>
                            <span className="text-sm text-foreground/60 group-hover/lesson:text-primary transition-colors truncate">
                              {lesson.title}
                            </span>
                            {lesson.duration && (
                              <span className="text-[10px] text-muted-foreground/30 ml-auto shrink-0">
                                {lesson.duration}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </section>
        )})}
      </div>
    </div>
  );
}
