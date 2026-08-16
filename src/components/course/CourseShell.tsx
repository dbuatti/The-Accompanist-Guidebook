"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Loader2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileText,
  CheckCircle2,
  LogOut,
  Menu,
  Eye,
  Music,
  Feather,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCourse } from "./CourseProvider";
import PaywallGate from "./PaywallGate";
import { formatModuleTitle } from "@/lib/utils";

export default function CourseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const {
    session,
    isPending,
    content,
    isLoading,
    isPaid,
    isAdmin,
    expandedLevels,
    toggleLevel,
    isLessonCompleted,
    publishAll,
    logout,
  } = useCourse();

  // Active route: /modules              -> curriculum
  //              /modules/:moduleSlug   -> module
  //              /modules/:moduleSlug/:lessonSlug -> lesson
  const segments = pathname.split("/").filter(Boolean); // ["modules", slug?, slug?]
  const activeModuleSlug = segments[1] || null;
  const activeLessonSlug = segments[2] || null;

  if (isLoading || (isPending && !session)) {
    return <div className="h-dvh flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin && !isPaid) {
    return <PaywallGate hasSession={!!session} />;
  }

  const nav = (
    <div className="space-y-6">
      {/* Back to home */}
      <Link
        href="/"
        className="flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl transition-all hover:bg-accent/20 text-foreground/70 border border-transparent hover:border-border/40"
      >
        <Home className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/50" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium leading-snug block">Back to home</span>
        </div>
      </Link>

      {/* Welcome */}
      <Link
        href="/welcome"
        className="flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl transition-all hover:bg-accent/20 text-foreground/70 border border-transparent hover:border-border/40"
      >
        <Feather className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/50" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium leading-snug block">Course welcome</span>
        </div>
      </Link>

      {/* All Modules */}
      <Link
        href="/modules"
        className={`flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl transition-all ${
          !activeModuleSlug
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "hover:bg-accent/20 text-foreground/70 border border-transparent hover:border-border/40"
        }`}
      >
        <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${!activeModuleSlug ? "text-primary-foreground/80" : "text-muted-foreground/50"}`} />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium leading-snug block">All Modules</span>
        </div>
      </Link>

      {content.map((level) => (
        <div key={level.id}>
          <button
            onClick={() => toggleLevel(level.id)}
            className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/30 transition-colors"
          >
            {expandedLevels[level.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{level.title}</span>
          </button>
          {expandedLevels[level.id] && (
            <div className="mt-2 space-y-1">
              {level.modules.map((mod: any) => {
                const isActive = activeModuleSlug === mod.slug;
                const isHidden = mod.isPublished === false;
                const done = mod.lessons.filter((l: any) => isLessonCompleted(l.id)).length;
                const total = mod.lessons.length;
                return (
                  <Link
                    key={mod.id}
                    href={`/modules/${mod.slug}`}
                    className={`flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "hover:bg-accent/20 text-foreground/70 border border-transparent hover:border-border/40"
                    }`}
                  >
                    <FolderOpen className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? "text-primary-foreground/80" : isHidden ? "text-muted-foreground/30" : "text-primary/60"}`} />
                    <div className="min-w-0 flex-1">
                      <span className={`text-sm font-medium leading-snug block ${isActive ? "" : isHidden ? "text-muted-foreground/50 italic" : ""}`}>
                        {formatModuleTitle(mod)}
                        {isHidden && (
                          <span className="ml-2 text-[10px] font-normal not-italic text-muted-foreground/40 uppercase tracking-wider">Coming soon</span>
                        )}
                      </span>
                      {!isActive && !isHidden && total > 0 && (
                        <span className="text-[10px] text-muted-foreground mt-1 block">{done}/{total} complete</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const currentModule = activeModuleSlug ? content.flatMap((l: any) => l.modules || []).find((m: any) => m.slug === activeModuleSlug) : null;

  return (
    <div className="h-dvh bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 border-r border-border/30 flex-col shrink-0 bg-gradient-to-b from-card/40 to-card/10">
        <div className="p-6 border-b border-border/30">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-serif font-bold text-primary leading-tight group-hover:text-primary/80 transition-colors">The Audition Guidebook</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Course modules &amp; resources</p>
            </div>
          </Link>
        </div>
        <ScrollArea className="flex-1 p-4">{nav}</ScrollArea>
        {session && (
          <div className="px-6 py-3 border-t border-border/30 bg-card/30">
            {(() => {
              const totalLessons = content.reduce((sum: number, l: any) => sum + (l.modules?.reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0) || 0), 0);
              const completedLessons = content.reduce((sum: number, l: any) => sum + (l.modules?.reduce((s: number, m: any) => s + (m.lessons?.filter((les: any) => isLessonCompleted(les.id)).length || 0), 0) || 0), 0);
              const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">Course progress</span>
                    <span className="text-[11px] font-bold text-primary">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{completedLessons} of {totalLessons} lessons completed</p>
                </div>
              );
            })()}
          </div>
        )}
        <div className="p-4 border-t border-border/30">
          {session ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">{session.user?.name || session.user?.email}</span>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={publishAll} className="h-7 text-[11px] text-primary hover:text-primary/80 px-2">
                    <Eye className="w-3 h-3 mr-1" /> Publish
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={logout} className="h-7 text-[11px] text-muted-foreground px-2">
                  <LogOut className="w-3 h-3 mr-1" /> Exit
                </Button>
              </div>
            </div>
          ) : (
            <Link href="/auth/sign-in" className="text-[11px] text-primary hover:underline">Sign in to track your progress</Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden h-14 border-b border-border/30 flex items-center justify-between px-4 shrink-0">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open navigation menu"><Menu className="w-5 h-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 flex flex-col gap-0 overflow-hidden">
              <div className="p-6 border-b border-border/30 shrink-0">
                <Link href="/" className="text-base font-serif font-bold text-primary hover:text-primary/80 transition-colors">The Audition Guidebook</Link>
              </div>
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4"
                onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setSheetOpen(false); }}
              >
                {nav}
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-serif font-semibold text-primary truncate max-w-[180px]">
            {activeLessonSlug ? "Lesson" : activeModuleSlug ? currentModule?.title || "Module" : "All Modules"}
          </span>
          {session ? (
            <div className="flex items-center gap-1">
              <Link href="/" className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/20 transition-colors" aria-label="Back to home">
                <Home className="w-4 h-4" />
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground" aria-label="Log out"><LogOut className="w-4 h-4" /></Button>
            </div>
          ) : (
            <Link href="/auth/sign-in" className="text-[11px] text-primary hover:underline">Sign in</Link>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
