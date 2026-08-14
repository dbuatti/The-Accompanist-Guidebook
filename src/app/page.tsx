"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music, BookOpen, Scissors, Mic, Piano, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="relative z-20">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-primary text-lg tracking-tight">
              The Accompanist Guidebook
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Browse Modules
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center">
        <div className="text-center space-y-8 max-w-3xl mx-auto px-6 pt-16 sm:pt-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-[11px] font-semibold uppercase tracking-[0.15em]">
              <Sparkles className="w-3 h-3" />
              For Musical Theatre Accompanists
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-primary tracking-tight leading-[1.08]">
              From first audition
              <span className="block text-foreground">to final callback.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A complete video course for musical theatre accompanists — cutting scores, preparing auditions, and collaborating with confidence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/modules"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              Browse Modules
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center gap-2 border border-border/30 bg-card/60 text-foreground/70 px-8 py-3.5 rounded-xl font-medium text-sm hover:border-primary/25 hover:text-primary transition-all"
            >
              Create Free Account
            </Link>
          </div>

          <div className="flex items-center justify-center gap-5 pt-4 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 3 levels of training</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Self-paced video lessons</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Progress tracking</span>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-20 w-full max-w-4xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Scissors, title: "Cut & Prepare", desc: "Mark professional cuts that any accompanist can sight-read cold." },
              { icon: Mic, title: "Audition Ready", desc: "Walk into any room with a confident handover, clear tempo, and presence." },
              { icon: Piano, title: "Collaboration", desc: "Work seamlessly with singers, directors, and music teams." },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/15 hover:shadow-md hover:shadow-primary/[0.03] transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-4 border border-primary/10">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-primary mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA band */}
        <div className="w-full max-w-4xl mx-auto px-6 mt-16">
          <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.05] to-transparent px-8 py-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-2">Ready to start?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Explore the curriculum and begin your first module today — no card required.
            </p>
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              View the Curriculum
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full mt-20 pb-10">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-primary/40" />
              <span className="text-[11px] text-muted-foreground/60">The Accompanist Guidebook</span>
            </div>
            <p className="text-[11px] text-muted-foreground/40 uppercase tracking-[0.2em]">
              Educational Resource &copy; 2026
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
