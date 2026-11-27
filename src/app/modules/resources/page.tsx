"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, ExternalLink, Headphones, Music2, Timer } from "lucide-react";
import { useCourse } from "@/components/course/CourseProvider";
import CourseHeader from "@/components/course/CourseHeader";

const resources = [
  {
    title: "Custom audition backing tracks",
    description:
      "Piano backings recorded for your cut, in your key, the way it’ll be played in the room. A great way to practise with a real accompaniment before your audition.",
    href: "https://pianobackings.danielebuatti.com",
    icon: Music2,
    cta: "Visit Piano Backings",
  },
  {
    title: "1:1 voice coaching",
    description:
      "Work directly with Daniele on repertoire, cut preparation, audition strategy, and performance confidence.",
    href: "https://www.danielebuatti.com/coaching",
    icon: Headphones,
    cta: "Explore coaching",
  },
  {
    title: "BPM tool",
    description:
      "A simple online metronome for finding and practising your tempo before you walk into the room.",
    href: "https://www.beatsperminuteonline.com/",
    icon: Timer,
    cta: "Open BPM tool",
  },
];

export default function ResourcesPage() {
  const { session, isAdmin, logout } = useCourse();

  return (
    <div className="min-h-dvh bg-background">
      <CourseHeader session={session} isAdmin={isAdmin} onLogout={logout} active="resources" />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-[11px] font-semibold uppercase tracking-[0.15em]">
            <BookOpen className="w-3.5 h-3.5" />
            Tools &amp; resources
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-serif font-bold text-primary">Helpful tools for your audition prep</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            External tools and services that pair well with the course. Links open in a new tab.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <a
                key={resource.href}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-border/30 bg-card/70 p-5 sm:p-6 hover:border-primary/20 hover:bg-card transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/10">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base sm:text-lg font-serif font-semibold text-primary leading-snug">
                        {resource.title}
                      </h2>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      {resource.cta}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-border/30 bg-muted/20 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Looking for lesson-specific downloads? They live inside each lesson under{" "}
            <span className="font-medium text-foreground/80">Resources</span>.
          </p>
          <Link href="/modules" className="mt-3 inline-flex text-sm text-primary hover:underline">
            Back to course curriculum
          </Link>
        </div>
      </main>
    </div>
  );
}
