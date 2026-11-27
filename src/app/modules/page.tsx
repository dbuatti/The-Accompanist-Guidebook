"use client";

import Link from "next/link";
import { BookOpen, Feather, LogOut, Music, Settings, Shield } from "lucide-react";
import { useCourse } from "@/components/course/CourseProvider";
import CurriculumView from "@/components/course/CurriculumView";
import { SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ModulesPage() {
  const { session, isAdmin, logout } = useCourse();

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border/30 bg-background/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
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
            <Link
              href="/modules/resources"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground/70 hover:text-primary hover:bg-accent/20 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" /> Resources
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
      <CurriculumView />
    </div>
  );
}
