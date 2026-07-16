"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music, BookOpen, Scissors, Mic, Piano } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/modules");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" />
    );
  }

  if (session) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
              <Music size={36} />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-primary tracking-tight leading-[1.1]">
              The Accompanist Guidebook
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
              A complete video course for musical theatre accompanists — from first audition to final callback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/modules"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" />
              Browse Modules
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center gap-2 border border-border/30 text-foreground/70 px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-accent/10 hover:border-primary/20 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-24 w-full max-w-3xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Scissors, title: "Cut & Prepare", desc: "Learn to mark professional cuts that any accompanist can sight-read cold." },
              { icon: Mic, title: "Audition Ready", desc: "Walk into any room with a confident handover, clear tempo, and presence." },
              { icon: Piano, title: "Collaboration", desc: "Build the skills to work seamlessly with singers, directors, and music teams." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-card/50 border border-border/20 hover:border-primary/10 hover:bg-card/70 transition-all">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-3 border border-primary/10">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-primary mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-20 text-[11px] text-muted-foreground/30 uppercase tracking-[0.2em]">
          Educational Resource &copy; 2026
        </p>
      </div>
    </div>
  );
}
