"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, LogOut, Menu, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCourse } from "@/components/course/CourseProvider";
import CurriculumNav from "@/components/course/CurriculumNav";
import { formatModuleTitle } from "@/lib/utils";

export default function ModuleReadingLayout({ children }: { children: React.ReactNode }) {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { getModule, session, logout, isAdmin } = useCourse();
  const module = getModule(moduleSlug);
  const segments = pathname.split("/").filter(Boolean);
  const currentLessonSlug = segments[2];

  return (
    <div className="h-dvh flex flex-col bg-background">
      <header className="h-14 sm:h-16 border-b border-border/30 flex items-center justify-between px-5 sm:px-8 shrink-0 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/modules"
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/20 transition-colors shrink-0"
            aria-label="Back to all modules"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/modules/${moduleSlug}`}
              className="text-sm font-serif font-semibold text-primary truncate hover:text-primary/80 transition-colors block"
            >
              {module ? formatModuleTitle(module) : "Module"}
            </Link>
            <p className="text-[11px] text-muted-foreground/70 truncate hidden sm:block">Course curriculum</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden gap-2 text-muted-foreground" aria-label="Open course curriculum">
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">Curriculum</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(22rem,calc(100vw-2rem))] p-0 flex flex-col gap-0 overflow-hidden">
              <div
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a")) setSheetOpen(false);
                }}
                className="flex-1 min-h-0"
              >
                <CurriculumNav moduleSlug={moduleSlug} currentLessonSlug={currentLessonSlug} />
              </div>
            </SheetContent>
          </Sheet>

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
                  <Link href="/modules">All modules</Link>
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
            <Link href="/auth/sign-in" className="text-sm text-primary hover:underline px-2">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
        <aside className="hidden lg:flex w-[21rem] border-l border-border/30 shrink-0 flex-col bg-card/40">
          <CurriculumNav moduleSlug={moduleSlug} currentLessonSlug={currentLessonSlug} />
        </aside>
      </div>
    </div>
  );
}
