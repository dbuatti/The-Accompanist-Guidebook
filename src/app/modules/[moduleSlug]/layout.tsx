"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, LogOut, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCourse } from "@/components/course/CourseProvider";
import ModuleLessonNav from "@/components/course/ModuleLessonNav";
import { formatModuleTitle } from "@/lib/utils";

export default function ModuleReadingLayout({ children }: { children: React.ReactNode }) {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { getModule, session, logout } = useCourse();
  const module = getModule(moduleSlug);
  const segments = pathname.split("/").filter(Boolean); // ["modules", moduleSlug, lessonSlug?]
  const currentLessonSlug = segments[2];

  return (
    <div className="h-dvh flex flex-col bg-background">
      <header className="h-14 border-b border-border/30 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/modules"
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/20 transition-colors shrink-0"
            aria-label="Back to all modules"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link href={`/modules/${moduleSlug}`} className="text-sm font-serif font-semibold text-primary truncate hover:text-primary/80 transition-colors">
            {module ? formatModuleTitle(module) : "Module"}
          </Link>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Lessons in this module">
                <ListChecks className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 flex flex-col gap-0 overflow-hidden">
              <div
                onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setSheetOpen(false); }}
                className="flex-1 min-h-0"
              >
                <ModuleLessonNav moduleSlug={moduleSlug} currentLessonSlug={currentLessonSlug} />
              </div>
            </SheetContent>
          </Sheet>
          {session && (
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground" aria-label="Log out">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
        <aside className="hidden lg:flex w-80 border-l border-border/20 shrink-0 flex-col bg-card/20">
          <ModuleLessonNav moduleSlug={moduleSlug} currentLessonSlug={currentLessonSlug} />
        </aside>
      </div>
    </div>
  );
}
