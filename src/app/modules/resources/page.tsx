"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, ExternalLink, Feather, Headphones, LogOut, Music, Music2, Settings, Shield, Timer } from "lucide-react";
import { useCourse } from "@/components/course/CourseProvider";
import { SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <header className="sticky top-0 z-20 border-b border-border/30 bg-background/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/modules" className="flex items-center gap-3 group min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif font-bold text-primary text-base leading-tight truncate group-hover:text-primary/80 transition-colors">
              {SITE_NAME}
            </span>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/modules"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground/70 hover:text-primary hover:bg-accent/20 transition-colors"
            >
              Curriculum
            </Link>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account/settings">Account settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/modules/resources">Tools &amp; resources</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/welcome">Welcome letter</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" /> Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/sign-in" className="text-sm text-primary hover:underline px-3">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

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
                className="group block rounded-2xl border border-border/40 bg-card/50 p-5 sm:p-6 hover:border-primary/20 hover:bg-card/70 transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
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
