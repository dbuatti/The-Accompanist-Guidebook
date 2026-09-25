"use client";

import { useEffect, useState } from "react";
import { Layers, PlayCircle, CheckCircle2 } from "lucide-react";
import { getPublicCurriculumPreview } from "@/app/actions";
import Reveal from "@/components/Reveal";
import { formatModuleTitle } from "@/lib/utils";
import type { CourseLevelPreview } from "@/lib/types";

const LEVEL_ACCENTS = [
  { label: "text-primary/70", chipBg: "bg-primary/[0.05]", chipText: "text-primary/70", rule: "from-primary/40" },
  { label: "text-indigo-500/70", chipBg: "bg-indigo-400/[0.06]", chipText: "text-indigo-600/70", rule: "from-indigo-400/50" },
  { label: "text-blue-500/70", chipBg: "bg-blue-400/[0.06]", chipText: "text-blue-600/70", rule: "from-blue-400/50" },
];

export default function CurriculumPreview() {
  const [content, setContent] = useState<CourseLevelPreview[] | null>(null);

  useEffect(() => {
    let mounted = true;
    getPublicCurriculumPreview().then((data) => {
      if (mounted) setContent(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (content === null || content.length === 0) return null;

  const totalLessons = content.reduce(
    (sum, lvl) => sum + lvl.modules.reduce((s, mod) => s + mod.lessons.length, 0),
    0
  );

  return (
    <section id="curriculum" className="w-full py-20 sm:py-24 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <div className="flex items-center gap-3 justify-center mb-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">
              What&apos;s inside
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-center text-3xl sm:text-4xl font-serif font-bold text-primary mb-3">
            The complete curriculum
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
            {content.length} levels, {content.length && content.reduce((s, l) => s + l.modules.length, 0)} modules,{" "}
            and {totalLessons} lessons — everything mapped out before you buy.
          </p>
        </Reveal>

        <div className="space-y-10">
          {content.map((level, li) => {
            const accent = LEVEL_ACCENTS[li % LEVEL_ACCENTS.length];
            return (
              <div key={level.id}>
                <Reveal>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Layers className={`w-4 h-4 ${accent.chipText}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accent.label}`}>
                        Level {li + 1}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-primary">{level.title}</h3>
                    <div className={`flex-1 h-px bg-gradient-to-r from-border/50 to-transparent ml-2`} />
                  </div>
                </Reveal>

                <div className="grid sm:grid-cols-2 gap-4">
                  {level.modules.map((mod, mi) => (
                    <Reveal key={mod.id} delay={mi * 60}>
                      <div
                        className="group relative h-full rounded-2xl border border-border/60 bg-card/50 hover:border-primary/20 hover:shadow-md hover:shadow-primary/[0.04] hover:-translate-y-0.5 transition-all duration-200 p-5 overflow-hidden"
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="text-sm font-serif font-semibold text-primary leading-snug">
                            {formatModuleTitle(mod)}
                          </p>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                            <PlayCircle className="w-3.5 h-3.5" />
                            {mod.lessons.length}
                          </span>
                        </div>
                        {mod.lessons.length > 0 && (
                          <ul className="space-y-1.5">
                            {mod.lessons.map((lesson) => (
                              <li key={lesson.id} className="flex items-start gap-2 text-xs text-foreground/70 leading-relaxed">
                                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${accent.chipText}`} />
                                <span className="truncate">{lesson.title}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}