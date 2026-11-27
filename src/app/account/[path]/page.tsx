"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Music } from "lucide-react";
import { AccountView } from "@neondatabase/auth/react";
import { SITE_NAME } from "@/lib/constants";

export default function AccountPage() {
  const { path } = useParams<{ path: string }>();

  return (
    <div className="min-h-screen bg-background">
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
          <Link href="/modules" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Back to course
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <AccountView path={path} />
      </main>
    </div>
  );
}
