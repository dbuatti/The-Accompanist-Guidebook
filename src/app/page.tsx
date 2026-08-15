"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music, Scissors, Mic, Piano, ArrowRight, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { authClient } from "@/lib/auth/client";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

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

  const primaryHref = paymentLink || "/modules";
  const primaryLabel = "Get Full Access";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-[-10%] w-[420px] h-[420px] rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="relative z-20">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-primary text-lg tracking-tight">
              The Audition Guidebook
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15 hover:shadow-lg hover:-translate-y-0.5"
            >
              {primaryLabel}
              <ArrowRight className="w-3.5 h-3.5" />
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

          <div className="flex flex-col items-center gap-4 pt-2">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              {primaryLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-muted-foreground/70">
              Already own the course?{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-5 pt-4 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 3 levels of training</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Self-paced video lessons</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Progress tracking</span>
          </div>
        </div>

        {/* What you'll master — soft mint band */}
        <section className="w-full mt-16 sm:mt-20 bg-periwinkle/40 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 justify-center mb-10">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">What you&apos;ll master</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: Scissors, n: "01", title: "Cut & Prepare", desc: "Mark professional cuts that any accompanist can sight-read cold." },
                { icon: Mic, n: "02", title: "Audition Ready", desc: "Walk into any room with a confident handover, clear tempo, and presence." },
                { icon: Piano, n: "03", title: "Collaboration", desc: "Work seamlessly with singers, directors, and music teams." },
              ].map((item) => (
                <div key={item.title} className="group p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/20 hover:shadow-md hover:shadow-primary/[0.04] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center border border-primary/10 transition-colors group-hover:bg-primary/10">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-serif text-lg text-accent-bright font-semibold tabular-nums">{item.n}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-primary mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The journey — deep pine band */}
        <section className="w-full bg-primary relative overflow-hidden py-20 sm:py-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-accent/[0.06] blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 justify-center mb-4">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent/70" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">The journey</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent/70" />
            </div>
            <h2 className="text-center text-3xl sm:text-4xl font-serif font-bold text-primary-foreground mb-3">A structured path, built for the room</h2>
            <p className="text-center text-sm text-primary-foreground/70 max-w-xl mx-auto mb-12 leading-relaxed">
              The course moves in three levels, each one strengthening the skills that read as professional in an audition setting.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { n: "01", name: "Foundations", desc: "Build reliable score-prep habits and annotation systems you can trust under pressure." },
                { n: "02", name: "Preparation", desc: "Develop confidence with tempo, cuts, and a handover that lands with singers and directors." },
                { n: "03", name: "Collaboration", desc: "Work with full presence alongside singers, directors, and music teams." },
              ].map((item) => (
                <div key={item.n} className="group p-6 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-3.5 h-3.5 text-accent/80" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent/80">Level {item.n}</span>
                  </div>
                  <h3 className="text-base font-serif font-semibold text-primary-foreground mb-1.5">{item.name}</h3>
                  <p className="text-xs text-primary-foreground/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pull quote */}
        <div className="w-full max-w-2xl mx-auto px-6 py-24">
          <blockquote className="relative border-l-[3px] border-accent/60 pl-6 sm:pl-8 py-2">
            <p className="font-serif italic text-xl sm:text-2xl text-primary/90 leading-relaxed">
              &ldquo;Every great audition is made before the singer walks into the room — in the score, the tempo, and the handover, ready to the last bar.&rdquo;
            </p>
          </blockquote>
        </div>

        {/* CTA band — brass tint */}
        <div className="w-full max-w-4xl mx-auto px-6 pb-24">
          <div className="relative rounded-3xl border border-accent/20 bg-accent/[0.06] px-8 py-12 sm:py-14 text-center overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none" />
            <div className="relative">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright mb-3 block">Ready when you are</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-3">Get full access to the complete course</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                Every module, lesson, and resource — yours for life, at your own pace.
              </p>
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                {primaryLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full pb-10">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-primary/40" />
              <span className="text-[11px] text-muted-foreground/60">The Audition Guidebook</span>
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
