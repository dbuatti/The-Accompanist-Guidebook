"use client";

import Link from "next/link";
import { Layers, FileText, ChevronRight } from "lucide-react";
import { formatModuleTitle } from "@/lib/utils";
import { useCourse } from "./CourseProvider";

const LEVEL_ACCENTS = [
  { badgeBg: "bg-primary/10", badgeText: "text-primary", label: "text-primary/50", iconBg: "bg-primary/[0.06] border-primary/10", iconText: "text-primary/60" },
  { badgeBg: "bg-indigo-400/10", badgeText: "text-indigo-600", label: "text-indigo-500/50", iconBg: "bg-indigo-400/[0.06] border-indigo-400/10", iconText: "text-indigo-600/60" },
  { badgeBg: "bg-blue-400/10", badgeText: "text-blue-600", label: "text-blue-500/50", iconBg: "bg-blue-400/[0.06] border-blue-400/10", iconText: "text-blue-600/60" },
];

export default function CurriculumView() {
  const { content, isLessonCompleted, session } = useCourse();
  const isLoggedIn = !!session;

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
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-10 py-10 sm:py-14 space-y-12 sm:space-y-14">
        {content.map((level: any, li: number) => {
          const accent = LEVEL_ACCENTS[li % LEVEL_ACCENTS.length];
          return (
          <section key={level.id}>
            <div className="flex items-center gap-4 mb-8">
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

            <div className="grid gap-4">
              {level.modules.map((mod: any) => {
                const done = mod.lessons.filter((l: any) => isLessonCompleted(l.id)).length;
                const total = mod.lessons.length;
                return (
                  <Link
                    key={mod.id}
                    href={`/modules/${mod.slug}`}
                    className="group relative border border-border/20 rounded-2xl bg-card/40 hover:bg-card/60 hover:border-primary/15 hover:shadow-md hover:shadow-primary/[0.02] transition-all duration-200 flex items-center gap-4 p-5"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${accent.iconBg}`}>
                      <span className={`text-sm font-bold ${accent.iconText}`}>
                        {String(mod.moduleNumber ?? "").padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-serif font-semibold text-primary group-hover:text-primary/80 transition-colors">
                        {formatModuleTitle(mod)}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {total} lesson{total !== 1 ? "s" : ""}
                        </span>
                        {isLoggedIn && total > 0 && (
                          <span className="text-xs text-muted-foreground/50">{done}/{total} complete</span>
                        )}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full border border-border/30 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shrink-0">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )})}
      </div>
    </div>
  );
}
