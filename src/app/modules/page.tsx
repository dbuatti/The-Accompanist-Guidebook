"use client";

import Link from "next/link";
import { Music, Feather, LogOut, Eye } from "lucide-react";
import { useCourse } from "@/components/course/CourseProvider";
import CurriculumView from "@/components/course/CurriculumView";
import { SITE_NAME } from "@/lib/constants";

export default function ModulesPage() {
  const { session, isAdmin, publishAll, logout } = useCourse();

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border/30 bg-background/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif font-bold text-primary text-base leading-tight truncate group-hover:text-primary/80 transition-colors">
              {SITE_NAME}
            </span>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/welcome"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground/70 hover:text-primary hover:bg-accent/20 transition-colors"
            >
              <Feather className="w-3.5 h-3.5" /> Welcome
            </Link>
            {isAdmin && (
              <button
                onClick={publishAll}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-primary hover:bg-accent/20 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Publish
              </button>
            )}
            {session ? (
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-accent/20 transition-colors"
                aria-label="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link href="/auth/sign-in" className="text-sm text-primary hover:underline px-3">Sign in</Link>
            )}
          </div>
        </div>
      </header>
      <CurriculumView />
    </div>
  );
}
