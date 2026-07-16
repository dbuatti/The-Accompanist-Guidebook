import { getCourseContent } from "@/app/actions/content";
import { formatModuleTitle } from "@/lib/utils";
import Link from "next/link";
import { BookOpen, CheckCircle2, FileText, Layers, Music } from "lucide-react";

export default async function CurriculumPage() {
  const content = await getCourseContent(false);

  const totalModules = content.reduce((sum, lvl) => sum + lvl.modules.length, 0);
  const totalLessons = content.reduce((sum, lvl) => sum + lvl.modules.reduce((s, mod) => s + mod.lessons.length, 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b border-border/20 bg-gradient-to-br from-primary/[0.04] via-primary/[0.02] to-transparent">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-16 pb-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Music className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary leading-tight mb-3">
            The Accompanist Guidebook
          </h1>
          <p className="text-sm text-muted-foreground/60">
            {totalModules} modules &middot; {totalLessons} lessons
          </p>
          <Link
            href="/modules"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <BookOpen className="w-4 h-4" /> Start Learning
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-12 space-y-10">
        {content.map((level, li) => (
          <section key={level.id}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Level {li + 1}
              </span>
              <div className="flex-1 h-px bg-border/30" />
            </div>
            <h2 className="text-xl font-serif font-bold text-primary mb-6">{level.title}</h2>

            <div className="space-y-4">
              {level.modules.map((mod) => (
                <div key={mod.id} className="border border-border/20 rounded-2xl bg-card/30 hover:bg-card/50 transition-colors">
                  <Link
                    href={`/modules?module=${mod.id}`}
                    className="flex items-center gap-4 p-5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 border border-primary/10">
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-serif font-semibold text-primary">
                        {formatModuleTitle(mod)}
                      </h3>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <FileText className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  </Link>

                  {mod.lessons.length > 0 && (
                    <div className="border-t border-border/10 mx-5">
                      {mod.lessons.map((lesson, i) => (
                        <Link
                          key={lesson.id}
                          href={`/modules?module=${mod.id}`}
                          className="flex items-center gap-3 py-2.5 px-1 hover:bg-accent/10 rounded-lg transition-colors group"
                        >
                          <span className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground/50 shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm text-foreground/70 group-hover:text-primary transition-colors truncate">
                            {lesson.title}
                          </span>
                          {lesson.duration && (
                            <span className="text-[11px] text-muted-foreground/40 ml-auto shrink-0">
                              {lesson.duration}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="border-t border-border/20 py-8 text-center">
        <p className="text-xs text-muted-foreground/40 uppercase tracking-[0.2em]">
          Educational Resource &copy; 2026
        </p>
      </footer>
    </div>
  );
}
