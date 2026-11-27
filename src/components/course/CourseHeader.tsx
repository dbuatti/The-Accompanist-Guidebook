"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Feather, Layers, LogOut, Menu, Music, Settings, Shield } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Active = "modules" | "resources" | "welcome" | "account" | null;

interface CourseHeaderProps {
  session?: unknown;
  isAdmin?: boolean;
  onLogout?: () => void | Promise<void>;
  active?: Active;
  maxWidthClass?: string;
  rightSlot?: React.ReactNode;
}

function navClass(active: boolean) {
  return `hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
    active
      ? "text-primary bg-primary/[0.08]"
      : "text-foreground/70 hover:text-primary hover:bg-accent/20"
  }`;
}

function mobileNavClass(active: boolean) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
    active ? "text-primary bg-primary/[0.08] font-medium" : "text-foreground/80 hover:text-primary hover:bg-accent/15"
  }`;
}

export default function CourseHeader({
  session,
  isAdmin = false,
  onLogout,
  active = null,
  maxWidthClass = "max-w-4xl",
  rightSlot,
}: CourseHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border/30 bg-background/90 backdrop-blur-sm">
      <div className={`${maxWidthClass} mx-auto px-5 sm:px-8 h-16 flex items-center justify-between`}>
        <Link href="/modules" className="flex items-center gap-3 group min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif font-bold text-primary text-base leading-tight truncate group-hover:text-primary/80 transition-colors">
            {SITE_NAME}
          </span>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <Link href="/modules" className={navClass(active === "modules")} aria-current={active === "modules" ? "page" : undefined}>
            Curriculum
          </Link>
          <Link href="/modules/resources" className={navClass(active === "resources")} aria-current={active === "resources" ? "page" : undefined}>
            <BookOpen className="w-3.5 h-3.5" /> Resources
          </Link>
          <Link href="/welcome" className={navClass(active === "welcome")} aria-current={active === "welcome" ? "page" : undefined}>
            <Feather className="w-3.5 h-3.5" /> Welcome
          </Link>

          {rightSlot}

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-2 text-muted-foreground">
                  <Settings className="w-4 h-4" />
                  <span>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/account/settings">Account settings</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                {onLogout && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => void onLogout()} className="text-destructive focus:text-destructive">
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/sign-in" className="hidden sm:inline-flex text-sm text-primary hover:underline px-3">
              Sign in
            </Link>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="sm:hidden text-muted-foreground" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,calc(100vw-2rem))] p-0 flex flex-col">
              <div className="px-5 py-4 border-b border-border/20 flex items-center justify-between">
                <span className="font-serif font-semibold text-primary">Menu</span>
              </div>
              <nav className="flex-1 p-3 space-y-1" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setMenuOpen(false); }}>
                <Link href="/modules" className={mobileNavClass(active === "modules")} aria-current={active === "modules" ? "page" : undefined}>
                  <Layers className="w-4 h-4" /> Curriculum
                </Link>
                <Link href="/modules/resources" className={mobileNavClass(active === "resources")} aria-current={active === "resources" ? "page" : undefined}>
                  <BookOpen className="w-4 h-4" /> Tools &amp; resources
                </Link>
                <Link href="/welcome" className={mobileNavClass(active === "welcome")} aria-current={active === "welcome" ? "page" : undefined}>
                  <Feather className="w-4 h-4" /> Welcome letter
                </Link>
                {!!session && (
                  <>
                    <div className="my-2 h-px bg-border/20" />
                    <Link href="/account/settings" className={mobileNavClass(active === "account")} aria-current={active === "account" ? "page" : undefined}>
                      <Settings className="w-4 h-4" /> Account settings
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className={mobileNavClass(false)}>
                        <Shield className="w-4 h-4" /> Admin
                      </Link>
                    )}
                  </>
                )}
              </nav>
              <div className="p-3 border-t border-border/20">
                {session ? (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); void onLogout?.(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
